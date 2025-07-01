import { FileSystem } from "@effect/platform/FileSystem";
import { type AbsolutePath } from "@total-typescript/shared";
import { Config, Console, Effect, Either } from "effect";

import { processTranscriptAnalysisForQueue } from "../queue-transcript-processing.js";
import { processArticleGenerationForQueue } from "../queue-article-generation.js";
import { AskQuestionService, LinksStorageService } from "../services.js";
import { WorkflowsService } from "../workflows.js";

class InvalidQueueItemTypeError extends Error {
  constructor(expectedType: string, actualType: string) {
    super(
      `Invalid queue item type: expected '${expectedType}', got '${actualType}'`
    );
    this.name = "InvalidQueueItemTypeError";
  }
}

export type QueueItemAction =
  | {
      type: "create-auto-edited-video";
      inputVideo: AbsolutePath;
      videoName: string;
      /**
       * Whether or not to render subtitles.
       */
      subtitles: boolean;
      /**
       * Whether or not to save the video to the
       * shorts directory.
       */
      dryRun: boolean;
    }
  | {
      /**
       * A request for the user to provide links
       * that the transcript editor uses to
       * find the relevant content.
       */
      type: "links-request";
      linkRequests: string[];
    }
  | {
      /**
       * Concatenate multiple completed videos together.
       * The videos will have their existing padding removed
       * and proper transitions added.
       */
      type: "concatenate-videos";
      videoIds: string[];
      outputVideoName: string;
      /**
       * Whether or not to save the video to the
       * shorts directory.
       */
      dryRun: boolean;
    }
  | {
      type: "analyze-transcript-for-links";
      transcriptPath: AbsolutePath;
      originalVideoPath: AbsolutePath;
    }
  | {
      type: "generate-article-from-transcript";
      transcriptPath: AbsolutePath;
      originalVideoPath: AbsolutePath;
      linksDependencyId: string;
      /**
       * Code information collected synchronously during video submission
       */
      codePath?: string;
      codeContent?: string;
    };

export type QueueItem = {
  id: string;
  createdAt: number;
  completedAt?: number;
  action: QueueItemAction;
  /**
   * An array of queue item ids that must be completed
   * before this item can be processed.
   */
  dependencies?: string[];
  status: "ready-to-run" | "completed" | "failed" | "requires-user-input";
  error?: string;
};

export type QueueState = {
  queue: QueueItem[];
};

const defaultQueueState: QueueState = {
  queue: [],
};

const ensureQueueExists = () => {
  return Effect.gen(function* () {
    const queueLocation = yield* Config.string("QUEUE_LOCATION");
    const fs = yield* FileSystem;
    const exists = yield* fs.exists(queueLocation);

    if (!exists) {
      yield* fs.writeFileString(
        queueLocation,
        JSON.stringify(defaultQueueState, null, 2)
      );
    }
  });
};

export const writeToQueue = (items: QueueItem[]) => {
  return Effect.gen(function* () {
    yield* ensureQueueExists();
    const queueLocation = yield* Config.string("QUEUE_LOCATION");
    const fs = yield* FileSystem;
    const existingQueue = yield* fs.readFileString(queueLocation);
    const queueState = JSON.parse(existingQueue) as QueueState;

    queueState.queue.push(...items);

    yield* fs.writeFileString(
      queueLocation,
      JSON.stringify(queueState, null, 2)
    );
  });
};

export const getQueueState = () => {
  return Effect.gen(function* () {
    yield* ensureQueueExists();
    const queueLocation = yield* Config.string("QUEUE_LOCATION");
    const fs = yield* FileSystem;
    const existingQueue = yield* fs.readFileString(queueLocation);
    const queueState = JSON.parse(existingQueue) as QueueState;

    return queueState;
  });
};

const updateQueueItem = (item: QueueItem) => {
  return Effect.gen(function* () {
    yield* ensureQueueExists();
    const queueLocation = yield* Config.string("QUEUE_LOCATION");
    const fs = yield* FileSystem;

    const queueState = yield* getQueueState();
    const index = queueState.queue.findIndex((i) => i.id === item.id);
    queueState.queue[index] = item;
    yield* fs.writeFileString(
      queueLocation,
      JSON.stringify(queueState, null, 2)
    );
  });
};

const writeQueueLockfile = () => {
  return Effect.gen(function* () {
    const queueLockfileLocation = yield* Config.string(
      "QUEUE_LOCKFILE_LOCATION"
    );
    const fs = yield* FileSystem;
    yield* fs.writeFileString(queueLockfileLocation, "");
  });
};

export const doesQueueLockfileExist = () => {
  return Effect.gen(function* () {
    const queueLockfileLocation = yield* Config.string(
      "QUEUE_LOCKFILE_LOCATION"
    );
    const fs = yield* FileSystem;
    const exists = yield* fs.exists(queueLockfileLocation);

    return exists;
  });
};

const deleteQueueLockfile = () => {
  return Effect.gen(function* () {
    const queueLockfileLocation = yield* Config.string(
      "QUEUE_LOCKFILE_LOCATION"
    );
    const fs = yield* FileSystem;
    yield* fs.remove(queueLockfileLocation);
  });
};

export const getNextQueueItem = (queueState: QueueState) => {
  const queueItemsAsMap = new Map(queueState.queue.map((i) => [i.id, i]));
  return queueState.queue.find((i) => {
    // Skip items that require user input - they should only be processed by processInformationRequests()
    if (i.status === "requires-user-input") {
      return false;
    }

    const canBeRun = i.status === "ready-to-run";

    const dependenciesAreMet =
      !i.dependencies ||
      i.dependencies.every(
        (dependency) => queueItemsAsMap.get(dependency)?.status === "completed"
      );

    return canBeRun && dependenciesAreMet;
  });
};

export const getOutstandingInformationRequests = () => {
  return Effect.gen(function* () {
    const queueState = yield* getQueueState();

    const queueItemsAsMap = new Map(queueState.queue.map((i) => [i.id, i]));

    const informationRequests = queueState.queue.filter(
      (item) =>
        item.action.type === "links-request" &&
        item.status === "requires-user-input" &&
        // Check that all dependencies are completed
        (!item.dependencies ||
          item.dependencies.every(
            (dependency) =>
              queueItemsAsMap.get(dependency)?.status === "completed"
          ))
    );

    return informationRequests;
  });
};

export const processInformationRequests = () => {
  return Effect.gen(function* () {
    if (yield* doesQueueLockfileExist()) {
      return yield* Console.log(
        "⏸️  Queue is locked, skipping information requests"
      );
    }

    const informationRequests = yield* getOutstandingInformationRequests();

    if (informationRequests.length === 0) {
      return yield* Console.log("📋 No outstanding information requests found");
    }

    yield* Console.log(
      `💬 Found ${informationRequests.length} outstanding information request(s) - user input required`
    );
    yield* writeQueueLockfile();

    const askQuestion = yield* AskQuestionService;
    const linkStorage = yield* LinksStorageService;

    let processedRequests = 0;

    for (const queueItem of informationRequests) {
      processedRequests++;

      if (queueItem.action.type === "links-request") {
        yield* Console.log(
          `🔗 Processing links request (${processedRequests}/${informationRequests.length})`
        );

        const links: { description: string; url: string }[] = [];

        yield* Console.log(
          `📝 Please provide URLs for ${queueItem.action.linkRequests.length} link request(s):`
        );

        for (const linkRequest of queueItem.action.linkRequests) {
          const link = yield* askQuestion.askQuestion(
            `🌐 Link for "${linkRequest}": `
          );

          links.push({
            description: linkRequest,
            url: link,
          });
        }

        yield* linkStorage.addLinks(links);

        yield* updateQueueItem({
          ...queueItem,
          status: "completed",
          completedAt: Date.now(),
        });

        yield* Console.log(
          `✅ Links request completed - added ${links.length} link(s)`
        );
      }
    }

    yield* Console.log(
      `🎉 All ${processedRequests} information request(s) processed successfully!`
    );
  }).pipe(
    Effect.ensuring(
      deleteQueueLockfile().pipe(
        // Fail silently
        Effect.catchAll(() => Effect.succeed(undefined))
      )
    )
  );
};

export const processQueue = () => {
  return Effect.gen(function* () {
    if (yield* doesQueueLockfileExist()) {
      return yield* Console.log("⏸️  Queue is locked, skipping processing");
    }

    yield* writeQueueLockfile();
    yield* Console.log("🚀 Starting queue processing...");

    const workflows = yield* WorkflowsService;
    let processedCount = 0;

    while (true) {
      const queueState = yield* getQueueState();
      const queueItem = getNextQueueItem(queueState);

      if (!queueItem) {
        if (processedCount === 0) {
          yield* Console.log("📋 No ready-to-run queue items found");
        } else {
          yield* Console.log(
            `✅ Queue processing complete. Processed ${processedCount} item(s)`
          );
        }
        return;
      }

      processedCount++;
      yield* Console.log(
        `📦 Processing queue item ${processedCount}: ${queueItem.action.type} (ID: ${queueItem.id})`
      );

      switch (queueItem.action.type) {
        case "create-auto-edited-video":
          yield* Console.log(
            `🎬 Creating auto-edited video: ${queueItem.action.videoName}`
          );
          const startTime = Date.now();

          const result = yield* workflows
            .createAutoEditedVideoWorkflow({
              inputVideo: queueItem.action.inputVideo,
              outputFilename: queueItem.action.videoName,
              subtitles: queueItem.action.subtitles,
              dryRun: queueItem.action.dryRun,
            })
            .pipe(Effect.either);

          if (Either.isLeft(result)) {
            const errorMessage =
              result.left instanceof Error
                ? result.left.message
                : String(result.left);

            yield* Console.log(`❌ Video creation failed: ${errorMessage}`);
            yield* Effect.logError("Video creation workflow failed", {
              queueItemId: queueItem.id,
              videoName: queueItem.action.videoName,
              inputVideo: queueItem.action.inputVideo,
              error: result.left,
            });

            yield* updateQueueItem({
              ...queueItem,
              status: "failed",
              error: `Video creation failed: ${errorMessage}`,
            });
            continue;
          }

          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          yield* Console.log(
            `✅ Video creation completed in ${duration}s: ${queueItem.action.videoName}`
          );

          yield* updateQueueItem({
            ...queueItem,
            status: "completed",
            completedAt: Date.now(),
          });

          break;
        case "links-request":
          // This should never happen since getNextQueueItem filters out requires-user-input items
          yield* Console.log(
            "ERROR: Links request found in processQueue - this should not happen"
          );
          continue;
        case "concatenate-videos":
          const concatenateResult = yield* workflows
            .concatenateVideosWorkflow({
              videoIds: queueItem.action.videoIds,
              outputVideoName: queueItem.action.outputVideoName,
              dryRun: queueItem.action.dryRun,
            })
            .pipe(Effect.either);

          if (Either.isLeft(concatenateResult)) {
            yield* Effect.logError(concatenateResult.left);
            yield* updateQueueItem({
              ...queueItem,
              status: "failed",
              error:
                concatenateResult.left instanceof Error
                  ? concatenateResult.left.message
                  : String(concatenateResult.left),
            });
            continue;
          }

          yield* updateQueueItem({
            ...queueItem,
            status: "completed",
            completedAt: Date.now(),
          });

          break;
        case "analyze-transcript-for-links":
          if (queueItem.action.type !== "analyze-transcript-for-links") {
            break;
          }

          yield* Console.log(`🔍 Analyzing transcript for links...`);
          const analysisStartTime = Date.now();

          const transcriptAnalysisResult = yield* Effect.gen(function* () {
            if (queueItem.action.type !== "analyze-transcript-for-links") {
              return yield* Effect.fail(
                new InvalidQueueItemTypeError(
                  "analyze-transcript-for-links",
                  queueItem.action.type
                )
              );
            }
            const currentQueueState = yield* getQueueState();

            // Type assertion is safe here because we've checked the type above
            const typedQueueItem = queueItem as QueueItem & {
              action: {
                type: "analyze-transcript-for-links";
                transcriptPath: AbsolutePath;
                originalVideoPath: AbsolutePath;
              };
            };

            return yield* processTranscriptAnalysisForQueue({
              queueItem: typedQueueItem,
              queueState: currentQueueState,
              updateQueueItem,
            });
          }).pipe(Effect.either);

          if (Either.isLeft(transcriptAnalysisResult)) {
            const errorMessage =
              transcriptAnalysisResult.left instanceof Error
                ? transcriptAnalysisResult.left.message
                : String(transcriptAnalysisResult.left);

            yield* Console.log(
              `❌ Transcript analysis failed: ${errorMessage}`
            );
            yield* Console.log(
              `💡 Tip: You can continue with manual article generation using: pnpm cli article-from-transcript`
            );

            yield* Effect.logError("Transcript analysis failed", {
              queueItemId: queueItem.id,
              transcriptPath: queueItem.action.transcriptPath,
              error: transcriptAnalysisResult.left,
            });

            yield* updateQueueItem({
              ...queueItem,
              status: "failed",
              error: `Transcript analysis failed: ${errorMessage}`,
            });
            continue;
          }

          const analysisDuration = (
            (Date.now() - analysisStartTime) /
            1000
          ).toFixed(1);
          const linkCount = Array.isArray(transcriptAnalysisResult.right)
            ? transcriptAnalysisResult.right.length
            : 0;
          yield* Console.log(
            `✅ Transcript analysis completed in ${analysisDuration}s. Generated ${linkCount} link request(s)`
          );

          yield* updateQueueItem({
            ...queueItem,
            status: "completed",
            completedAt: Date.now(),
          });

          break;
        case "generate-article-from-transcript":
          if (queueItem.action.type !== "generate-article-from-transcript") {
            break;
          }

          yield* Console.log(`📝 Generating article from transcript...`);
          const articleStartTime = Date.now();

          const articleGenerationResult = yield* Effect.gen(function* () {
            if (queueItem.action.type !== "generate-article-from-transcript") {
              return yield* Effect.fail(
                new InvalidQueueItemTypeError(
                  "generate-article-from-transcript",
                  queueItem.action.type
                )
              );
            }
            const currentQueueState = yield* getQueueState();

            // Type assertion is safe here because we've checked the type above
            const typedQueueItem = queueItem as QueueItem & {
              action: {
                type: "generate-article-from-transcript";
                transcriptPath: AbsolutePath;
                originalVideoPath: AbsolutePath;
                linksDependencyId: string;
                codePath?: string;
                codeContent?: string;
              };
            };

            return yield* processArticleGenerationForQueue({
              queueItem: typedQueueItem,
              queueState: currentQueueState,
            });
          }).pipe(Effect.either);

          if (Either.isLeft(articleGenerationResult)) {
            const errorMessage =
              articleGenerationResult.left instanceof Error
                ? articleGenerationResult.left.message
                : String(articleGenerationResult.left);

            yield* Console.log(`❌ Article generation failed: ${errorMessage}`);
            yield* Console.log(
              `💡 Tip: Video processing completed successfully. You can manually create an article using: pnpm cli article-from-transcript`
            );

            yield* Effect.logError("Article generation failed", {
              queueItemId: queueItem.id,
              transcriptPath: queueItem.action.transcriptPath,
              error: articleGenerationResult.left,
            });

            yield* updateQueueItem({
              ...queueItem,
              status: "failed",
              error: `Article generation failed: ${errorMessage}`,
            });
            continue;
          }

          const articleDuration = (
            (Date.now() - articleStartTime) /
            1000
          ).toFixed(1);
          yield* Console.log(
            `✅ Article generation completed in ${articleDuration}s`
          );

          yield* updateQueueItem({
            ...queueItem,
            status: "completed",
            completedAt: Date.now(),
          });

          break;
        default:
          queueItem.action satisfies never;
          yield* Console.log("Unknown queue item type");
          break;
      }
      yield* Console.log("Queue item processed");
    }
  }).pipe(
    Effect.ensuring(
      deleteQueueLockfile().pipe(
        // Fail silently
        Effect.catchAll(() => Effect.succeed(undefined))
      )
    )
  );
};
