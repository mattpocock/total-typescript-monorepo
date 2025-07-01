import { FileSystem } from "@effect/platform";
import { type AbsolutePath } from "@total-typescript/shared";
import { ConfigError, Console, Data, Effect } from "effect";
import { generateArticleCore } from "./article-from-transcript.js";
import type { QueueItem, QueueState } from "./queue/queue.js";
import { LinksStorageService } from "./services.js";
import type { PlatformError } from "@effect/platform/Error";

export class TranscriptReadError extends Data.TaggedError(
  "TranscriptReadError"
)<{
  transcriptPath: AbsolutePath;
  cause: unknown;
}> {}

export class CodeDependencyNotFoundError extends Data.TaggedError(
  "CodeDependencyNotFoundError"
)<{
  codeDependencyId: string;
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
  codeDependencyId: string;
  linksDependencyId: string;
  queueState: QueueState;
}) {
  const {
    transcriptPath,
    originalVideoPath,
    codeDependencyId,
    linksDependencyId,
    queueState,
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

  // Use the shared core article generation logic
  const result = yield* generateArticleCore({
    originalVideoPath,
    transcript: transcriptContent,
    code: "",
    urls,
  }).pipe(
    Effect.mapError((error) => {
      return new ArticleGenerationError({
        transcriptPath,
        cause: error,
      });
    })
  );

  yield* Console.log(
    `Successfully generated and stored article: ${result.title}`
  );

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
      codeDependencyId: string;
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
    codeDependencyId: queueItem.action.codeDependencyId,
    linksDependencyId: queueItem.action.linksDependencyId,
    queueState,
  });

  yield* Console.log(
    `Successfully generated article: ${result.title} (${result.filename})`
  );

  return result;
});
