import { FileSystem } from "@effect/platform";
import { type AbsolutePath } from "@total-typescript/shared";
import { Console, Data, Effect } from "effect";
import type { PlatformError } from "@effect/platform/Error";
import { LinksStorageService } from "./services.js";
import { generateArticleCore } from "./article-from-transcript.js";
import type { QueueItem, QueueState } from "./queue/queue.js";

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
 * Retrieves code content from a completed queue item's temporaryData
 */
export const getCodeFromQueueItem = Effect.fn("getCodeFromQueueItem")(
  function* (opts: {
    queueItemId: string;
    queueState: QueueState;
  }): Effect.Effect<string | undefined, CodeDependencyNotFoundError> {
    const { queueItemId, queueState } = opts;

    const queueItem = queueState.queue.find((item) => item.id === queueItemId);

    if (!queueItem) {
      return yield* Effect.fail(new CodeDependencyNotFoundError({
        codeDependencyId: queueItemId,
      }));
    }

    if (queueItem.action.type !== "code-request") {
      return yield* Effect.fail(new CodeDependencyNotFoundError({
        codeDependencyId: queueItemId,
      }));
    }

    if (queueItem.status !== "completed") {
      return yield* Effect.fail(new CodeDependencyNotFoundError({
        codeDependencyId: queueItemId,
      }));
    }

    // Return the code content from temporaryData, or undefined if not available
    return queueItem.action.temporaryData?.codeContent;
  }
);

/**
 * Validates that the links dependency queue item exists and is completed
 */
export const validateLinksDependency = Effect.fn("validateLinksDependency")(
  function* (opts: {
    linksDependencyId: string;
    queueState: QueueState;
  }): Effect.Effect<void, LinksDependencyNotFoundError> {
    const { linksDependencyId, queueState } = opts;

    const queueItem = queueState.queue.find((item) => item.id === linksDependencyId);

    if (!queueItem) {
      return yield* Effect.fail(new LinksDependencyNotFoundError({
        linksDependencyId,
      }));
    }

    if (queueItem.action.type !== "links-request") {
      return yield* Effect.fail(new LinksDependencyNotFoundError({
        linksDependencyId,
      }));
    }

    if (queueItem.status !== "completed") {
      return yield* Effect.fail(new LinksDependencyNotFoundError({
        linksDependencyId,
      }));
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
    return yield* Effect.fail(new ArticleGenerationError({
      transcriptPath,
      cause: new Error("Transcript is empty or contains only whitespace"),
    }));
  }

  // Validate links dependency
  yield* validateLinksDependency({
    linksDependencyId,
    queueState,
  });

  // Get code content from queue item (optional, may be undefined)
  const codeContent = yield* getCodeFromQueueItem({
    queueItemId: codeDependencyId,
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

  if (codeContent) {
    yield* Console.log(
      `Using code content (${codeContent.length} characters) for article generation`
    );
  } else {
    yield* Console.log("No code content available for article generation");
  }

  // Use the shared core article generation logic
  const result = yield* generateArticleCore({
    originalVideoPath,
    transcript: transcriptContent,
    code: codeContent,
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
  updateQueueItem: (item: QueueItem) => Effect.Effect<void>;
}) {
  const { queueItem, queueState, updateQueueItem } = opts;

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