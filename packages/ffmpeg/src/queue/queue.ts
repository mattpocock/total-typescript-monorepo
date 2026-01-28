import { type AbsolutePath } from "@total-typescript/shared";
import { Console, Effect, Either } from "effect";

import { processTranscriptAnalysisForQueue } from "../queue-transcript-processing.js";
import { processArticleGenerationForQueue } from "../queue-article-generation.js";
import { WorkflowsService } from "../workflows.js";
import {
  QueueUpdaterService,
  type QueueState,
} from "./queue-updater-service.js";
import type { ClipWithMetadata } from "../video-clip-types.js";

export class InvalidQueueItemTypeError extends Error {
  constructor(expectedType: string, actualType: string) {
    super(
      `Invalid queue item type: expected '${expectedType}', got '${actualType}'`,
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
      type: "create-video-from-clips";
      clips: readonly ClipWithMetadata[];
      outputVideoName: string;
      shortsDirectoryOutputName: string | undefined;
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
      videoName: string;
      dryRun: boolean;
      alongside: boolean;
      codeContent: string;
      codePath: string;
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

export const getNextQueueItems = (queueState: QueueState) => {
  const queueItemsAsMap = new Map(queueState.queue.map((i) => [i.id, i]));
  return queueState.queue.filter((i) => {
    // Skip items that require user input
    if (i.status === "requires-user-input") {
      return false;
    }

    const canBeRun = i.status === "ready-to-run";

    const dependenciesAreMet =
      !i.dependencies ||
      i.dependencies.every(
        (dependency) => queueItemsAsMap.get(dependency)?.status === "completed",
      );

    return canBeRun && dependenciesAreMet;
  });
};

export const processQueue = () => {
  return Effect.gen(function* () {
    const queueUpdater = yield* QueueUpdaterService;

    yield* Console.log("🚀 Starting queue processing...");

    const workflows = yield* WorkflowsService;
    let processedCount = 0;

    while (true) {
      const queueState = yield* queueUpdater.getQueueState();
      const queueItems = getNextQueueItems(queueState);

      if (queueItems.length === 0) {
        if (processedCount === 0) {
          yield* Console.log("📋 No ready-to-run queue items found");
        } else {
          yield* Console.log(
            `✅ Queue processing complete. Processed ${processedCount} item(s)`,
          );
        }
        return;
      }

      processedCount++;

      yield* Effect.all(
        queueItems.map((queueItem) => {
          return Effect.gen(function* () {
            yield* Console.log(
              `📦 Processing queue item ${processedCount}: ${queueItem.action.type} (ID: ${queueItem.id})`,
            );

            switch (queueItem.action.type) {
              case "create-auto-edited-video":
                yield* Console.log(
                  `🎬 Creating auto-edited video: ${queueItem.action.videoName}`,
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
                  yield* Console.log(
                    `❌ Video creation failed: ${result.left.message}`,
                  );
                  if ("cause" in result.left) {
                    yield* Console.log(result.left.cause);
                  }

                  yield* Effect.logError("Video creation workflow failed", {
                    queueItemId: queueItem.id,
                    videoName: queueItem.action.videoName,
                    inputVideo: queueItem.action.inputVideo,
                    error: result.left,
                  });

                  yield* queueUpdater.updateQueueItem({
                    ...queueItem,
                    status: "failed",
                    error: `Video creation failed: ${result.left.message}`,
                  });
                  return;
                }

                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                yield* Console.log(
                  `✅ Video creation completed in ${duration}s: ${queueItem.action.videoName}`,
                );

                yield* queueUpdater.updateQueueItem({
                  ...queueItem,
                  status: "completed",
                  completedAt: Date.now(),
                });

                break;
              case "links-request":
                // This should never happen since getNextQueueItem filters out requires-user-input items
                yield* Console.log(
                  "ERROR: Links request found in processQueue - this should not happen",
                );
                return;
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
                  yield* queueUpdater.updateQueueItem({
                    ...queueItem,
                    status: "failed",
                    error:
                      concatenateResult.left instanceof Error
                        ? concatenateResult.left.message
                        : String(concatenateResult.left),
                  });
                  return;
                }

                yield* queueUpdater.updateQueueItem({
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

                const transcriptAnalysisResult = yield* Effect.gen(
                  function* () {
                    if (
                      queueItem.action.type !== "analyze-transcript-for-links"
                    ) {
                      return yield* Effect.fail(
                        new InvalidQueueItemTypeError(
                          "analyze-transcript-for-links",
                          queueItem.action.type,
                        ),
                      );
                    }
                    const currentQueueState =
                      yield* queueUpdater.getQueueState();

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
                      updateQueueItem: queueUpdater.updateQueueItem,
                    });
                  },
                ).pipe(Effect.either);

                if (Either.isLeft(transcriptAnalysisResult)) {
                  const errorMessage =
                    transcriptAnalysisResult.left instanceof Error
                      ? transcriptAnalysisResult.left.message
                      : String(transcriptAnalysisResult.left);

                  yield* Console.log(
                    `❌ Transcript analysis failed: ${errorMessage}`,
                  );
                  yield* Console.log(
                    `💡 Tip: You can continue with manual article generation using: pnpm cli article-from-transcript`,
                  );

                  yield* Effect.logError("Transcript analysis failed", {
                    queueItemId: queueItem.id,
                    transcriptPath: queueItem.action.transcriptPath,
                    error: transcriptAnalysisResult.left,
                  });

                  yield* queueUpdater.updateQueueItem({
                    ...queueItem,
                    status: "failed",
                    error: `Transcript analysis failed: ${errorMessage}`,
                  });
                  return;
                }

                const analysisDuration = (
                  (Date.now() - analysisStartTime) /
                  1000
                ).toFixed(1);
                const linkCount = Array.isArray(transcriptAnalysisResult.right)
                  ? transcriptAnalysisResult.right.length
                  : 0;
                yield* Console.log(
                  `✅ Transcript analysis completed in ${analysisDuration}s. Generated ${linkCount} link request(s)`,
                );

                yield* queueUpdater.updateQueueItem({
                  ...queueItem,
                  status: "completed",
                  completedAt: Date.now(),
                });

                break;
              case "generate-article-from-transcript":
                if (
                  queueItem.action.type !== "generate-article-from-transcript"
                ) {
                  break;
                }

                yield* Console.log(`📝 Generating article from transcript...`);
                const articleStartTime = Date.now();

                const articleGenerationResult = yield* Effect.gen(function* () {
                  if (
                    queueItem.action.type !== "generate-article-from-transcript"
                  ) {
                    return yield* Effect.fail(
                      new InvalidQueueItemTypeError(
                        "generate-article-from-transcript",
                        queueItem.action.type,
                      ),
                    );
                  }
                  const currentQueueState = yield* queueUpdater.getQueueState();

                  // Type assertion is safe here because we've checked the type above
                  const typedQueueItem = queueItem as QueueItem & {
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

                  yield* Console.log(
                    `❌ Article generation failed: ${errorMessage}`,
                  );
                  yield* Console.log(
                    `💡 Tip: Video processing completed successfully. You can manually create an article using: pnpm cli article-from-transcript`,
                  );

                  yield* Effect.logError("Article generation failed", {
                    queueItemId: queueItem.id,
                    transcriptPath: queueItem.action.transcriptPath,
                    error: articleGenerationResult.left,
                  });

                  yield* queueUpdater.updateQueueItem({
                    ...queueItem,
                    status: "failed",
                    error: `Article generation failed: ${errorMessage}`,
                  });
                  return;
                }

                const articleDuration = (
                  (Date.now() - articleStartTime) /
                  1000
                ).toFixed(1);
                yield* Console.log(
                  `✅ Article generation completed in ${articleDuration}s`,
                );

                yield* queueUpdater.updateQueueItem({
                  ...queueItem,
                  status: "completed",
                  completedAt: Date.now(),
                });

                break;
              case "create-video-from-clips": {
                const createVideoFromClipsResult = yield* workflows
                  .createVideoFromClipsWorkflow({
                    clips: queueItem.action.clips,
                    outputVideoName: queueItem.action.outputVideoName,
                    shortsDirectoryOutputName:
                      queueItem.action.shortsDirectoryOutputName,
                  })
                  .pipe(Effect.either);

                if (Either.isLeft(createVideoFromClipsResult)) {
                  yield* Effect.logError(createVideoFromClipsResult.left);
                  yield* queueUpdater.updateQueueItem({
                    ...queueItem,
                    status: "failed",
                    error: createVideoFromClipsResult.left.message,
                  });
                  return;
                }
                yield* queueUpdater.updateQueueItem({
                  ...queueItem,
                  status: "completed",
                  completedAt: Date.now(),
                });
                break;
              }
              default:
                queueItem.action satisfies never;
                yield* Console.log("Unknown queue item type");
                break;
            }
            yield* Console.log("Queue item processed");
          });
        }),
        { concurrency: "unbounded" },
      );
    }
  });
};
