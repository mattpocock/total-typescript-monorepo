import { FileSystem } from "@effect/platform";
import { type AbsolutePath } from "@total-typescript/shared";
import { Config, ConfigError, Console, Data, Effect } from "effect";
import { generateArticleCore } from "./article-from-transcript.js";
import type { QueueItem, QueueState } from "./queue/queue.js";
import { LinksStorageService } from "./services.js";
import type { PlatformError } from "@effect/platform/Error";
import path from "node:path";

export class TranscriptReadError extends Data.TaggedError(
  "TranscriptReadError"
)<{
  transcriptPath: AbsolutePath;
  cause: unknown;
}> {}



export class LinksDependencyNotFoundError extends Data.TaggedError(
  "LinksDependencyNotFoundError"
)<{
  linksDependencyId: string;
}> {}

export class ArticleGenerationError extends Data.TaggedError(
  "ArticleGenerationError"
)<{
  transcriptPath: AbsolutePath;
  cause: unknown;
}> {}

/**
 * Validates that the links dependency queue item exists and is completed
 */
export const validateLinksDependency = Effect.fn("validateLinksDependency")(
  function* (opts: { linksDependencyId: string; queueState: QueueState }) {
    const { linksDependencyId, queueState } = opts;

    const queueItem = queueState.queue.find(
      (item) => item.id === linksDependencyId
    );

    if (!queueItem) {
      return yield* Effect.fail(
        new LinksDependencyNotFoundError({
          linksDependencyId,
        })
      );
    }

    if (queueItem.action.type !== "links-request") {
      return yield* Effect.fail(
        new LinksDependencyNotFoundError({
          linksDependencyId,
        })
      );
    }

    if (queueItem.status !== "completed") {
      return yield* Effect.fail(
        new LinksDependencyNotFoundError({
          linksDependencyId,
        })
      );
    }

    return undefined;
  }
);

/**
 * Queue-friendly article generation that retrieves dependencies from queue items and storage
 */
export const generateArticleFromTranscriptQueue = Effect.fn(
  "generateArticleFromTranscriptQueue"
)(function* (opts: {
  transcriptPath: AbsolutePath;
  originalVideoPath: AbsolutePath;
  linksDependencyId: string;
  queueState: QueueState;
  videoName?: string;
  dryRun?: boolean;
  alongside?: boolean;
  codeContent?: string;
  codePath?: string;
}) {
  const {
    transcriptPath,
    originalVideoPath,
    linksDependencyId,
    queueState,
    videoName,
    dryRun,
    alongside,
    codeContent = "",
    codePath = "",
  } = opts;

  const fs = yield* FileSystem.FileSystem;
  const linksStorage = yield* LinksStorageService;

  yield* Effect.logDebug(
    `Generating article from transcript: ${transcriptPath}`
  );

  // Read the transcript content
  const transcriptContent = yield* fs.readFileString(transcriptPath).pipe(
    Effect.mapError((error) => {
      return new TranscriptReadError({
        transcriptPath,
        cause: error,
      });
    })
  );

  // Handle empty transcript
  if (!transcriptContent.trim()) {
    return yield* Effect.fail(
      new ArticleGenerationError({
        transcriptPath,
        cause: new Error("Transcript is empty or contains only whitespace"),
      })
    );
  }

  // Validate links dependency
  yield* validateLinksDependency({
    linksDependencyId,
    queueState,
  });

  // Get links from storage (these were stored when links-request was processed)
  const storedLinks = yield* linksStorage.getLinks();

  // Convert stored links to the format expected by the AI service
  const urls = storedLinks.map((link) => ({
    request: link.description,
    url: link.url,
  }));

  yield* Console.log(
    `Found ${urls.length} stored links for article generation`
  );

  // Log code information
  if (codeContent) {
    yield* Console.log(
      `Using provided code: ${codePath} (${codeContent.length} characters)`
    );
  } else {
    yield* Console.log("No code provided for article generation");
  }

  let generateOptions: {
    originalVideoPath: AbsolutePath;
    transcript: string;
    code: string;
    urls: { request: string; url: string }[];
    storageMode?: "article-storage" | "alongside-video";
    videoDirectory?: string;
    videoName?: string;
  } = {
    originalVideoPath,
    transcript: transcriptContent,
    code: codeContent,
    urls,
  };

  // If alongside flag is set and we have video info, save alongside the video
  if (alongside && videoName && dryRun !== undefined) {
    const exportDirectory = yield* Config.string("EXPORT_DIRECTORY");
    const shortsExportDirectory = yield* Config.string("SHORTS_EXPORT_DIRECTORY");
    
    // Determine where the video is located based on dryRun flag
    const videoDirectory = dryRun ? exportDirectory : shortsExportDirectory;
    
    generateOptions = {
      ...generateOptions,
      storageMode: "alongside-video" as const,
      videoDirectory,
      videoName,
    };

    yield* Console.log(
      `Article will be saved alongside video in: ${videoDirectory}/${videoName}.md`
    );
  }

  // Use the shared core article generation logic
  const result = yield* generateArticleCore(generateOptions).pipe(
    Effect.mapError((error) => {
      return new ArticleGenerationError({
        transcriptPath,
        cause: error,
      });
    })
  );

  if (alongside) {
    yield* Console.log(
      `Successfully generated and saved article alongside video: ${result.title}`
    );
  } else {
    yield* Console.log(
      `Successfully generated and stored article: ${result.title}`
    );
  }

  return {
    title: result.title,
    filename: result.filename,
  };
});

/**
 * Processes article generation queue items
 */
export const processArticleGenerationForQueue = Effect.fn(
  "processArticleGenerationForQueue"
)(function* (opts: {
  queueItem: QueueItem & {
    action: {
      type: "generate-article-from-transcript";
      transcriptPath: AbsolutePath;
      originalVideoPath: AbsolutePath;
      linksDependencyId: string;
      videoName: string;
      dryRun: boolean;
      alongside: boolean;
      codeContent: string;
      codePath: string;
    };
  };
  queueState: QueueState;
}) {
  const { queueItem, queueState } = opts;

  yield* Console.log(
    `Processing generate-article-from-transcript for ${queueItem.action.transcriptPath}`
  );

  const result = yield* generateArticleFromTranscriptQueue({
    transcriptPath: queueItem.action.transcriptPath,
    originalVideoPath: queueItem.action.originalVideoPath,
    linksDependencyId: queueItem.action.linksDependencyId,
    queueState,
    videoName: queueItem.action.videoName,
    dryRun: queueItem.action.dryRun,
    alongside: queueItem.action.alongside,
    codeContent: queueItem.action.codeContent,
    codePath: queueItem.action.codePath,
  });

  yield* Console.log(
    `Successfully generated article: ${result.title} (${result.filename})`
  );

  return result;
});
