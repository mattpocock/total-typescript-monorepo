import { type AbsolutePath } from "@total-typescript/shared";
import { ConfigError, Console, Data, Effect } from "effect";
import { analyzeTranscriptForLinks } from "./transcript-analysis.js";
import type { QueueItem, QueueState } from "./queue/queue.js";
import type { PlatformError } from "@effect/platform/Error";
import type { FileSystem } from "@effect/platform";

export class DependentLinksRequestNotFoundError extends Data.TaggedError(
  "DependentLinksRequestNotFoundError"
)<{
  transcriptAnalysisItemId: string;
}> {}

export const processTranscriptAnalysisForQueue = Effect.fn(
  "processTranscriptAnalysisForQueue"
)(function* (opts: {
  queueItem: QueueItem & {
    action: {
      type: "analyze-transcript-for-links";
      transcriptPath: AbsolutePath;
      originalVideoPath: AbsolutePath;
    };
  };
  queueState: QueueState;
  updateQueueItem: (
    item: QueueItem
  ) => Effect.Effect<
    void,
    ConfigError.ConfigError | PlatformError,
    FileSystem.FileSystem
  >;
}) {
  const { queueItem, queueState, updateQueueItem } = opts;

  yield* Console.log(
    `Processing analyze-transcript-for-links for ${queueItem.action.transcriptPath}`
  );

  // Generate link requests from transcript
  const linkRequests = yield* analyzeTranscriptForLinks({
    transcriptPath: queueItem.action.transcriptPath,
    originalVideoPath: queueItem.action.originalVideoPath,
  });

  if (linkRequests.length > 0) {
    // Find the existing links-request queue item that depends on this analysis
    const linksRequestItem = queueState.queue.find(
      (item) =>
        item.action.type === "links-request" &&
        item.dependencies?.includes(queueItem.id)
    );

    if (!linksRequestItem) {
      return yield* new DependentLinksRequestNotFoundError({
        transcriptAnalysisItemId: queueItem.id,
      });
    }

    // Update the existing links-request item with the generated requests
    yield* updateQueueItem({
      ...linksRequestItem,
      action: {
        type: "links-request",
        linkRequests,
      },
      status: "requires-user-input",
    });

    yield* Console.log(
      `Updated existing links request queue item ${linksRequestItem.id} with ${linkRequests.length} requests`
    );
  } else {
    yield* Console.log("No link requests generated from transcript");
  }

  return linkRequests;
});
