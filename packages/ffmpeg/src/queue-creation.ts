import { type AbsolutePath } from "@total-typescript/shared";
import path from "path";
import { Config, Effect } from "effect";
import type { QueueItem } from "./queue/queue.js";

export interface CreateAutoEditedVideoQueueItemsOptions {
  inputVideo: AbsolutePath;
  videoName: string;
  subtitles: boolean;
  dryRun: boolean;
  generateArticle: boolean;
}

export const createAutoEditedVideoQueueItems = Effect.fn(
  "createAutoEditedVideoQueueItems"
)(function* (opts: CreateAutoEditedVideoQueueItemsOptions) {
  const {
    inputVideo,
    videoName,
    subtitles,
    dryRun,
    generateArticle,
  } = opts;

  // Get environment configuration
  const transcriptionDirectory = yield* Config.string("TRANSCRIPTION_DIRECTORY");
  const obsOutputDirectory = yield* Config.string("OBS_OUTPUT_DIRECTORY");

  // Generate unique IDs for all queue items
  const videoId = crypto.randomUUID();
  const transcriptAnalysisId = crypto.randomUUID();
  const codeRequestId = crypto.randomUUID();
  const linksRequestId = crypto.randomUUID();
  const articleGenerationId = crypto.randomUUID();

  // Create the base video creation queue item
  const queueItems: QueueItem[] = [
    {
      id: videoId,
      createdAt: Date.now(),
      action: {
        type: "create-auto-edited-video",
        inputVideo,
        videoName,
        subtitles,
        dryRun,
      },
      status: "ready-to-run",
    },
  ];

  // If article generation is enabled, add the additional queue items with dependencies
  if (generateArticle) {
    // Get the transcript path that will be created by the video processing
    const transcriptPath = path.join(
      transcriptionDirectory,
      `${videoName}.txt`
    ) as AbsolutePath;

    // Get the original video path structure that matches the storage service
    const originalVideoPath = path.join(
      obsOutputDirectory,
      path.basename(inputVideo)
    ) as AbsolutePath;

    queueItems.push(
      // 2. Transcript analysis (depends on video creation)
      {
        id: transcriptAnalysisId,
        createdAt: Date.now(),
        action: {
          type: "analyze-transcript-for-links",
          transcriptPath,
          originalVideoPath,
        },
        dependencies: [videoId],
        status: "ready-to-run",
      },
      // 3. Code request (depends on transcript analysis)
      {
        id: codeRequestId,
        createdAt: Date.now(),
        action: {
          type: "code-request",
          transcriptPath,
          originalVideoPath,
        },
        dependencies: [transcriptAnalysisId],
        status: "requires-user-input",
      },
      // 4. Links request (depends on code request)
      {
        id: linksRequestId,
        createdAt: Date.now(),
        action: {
          type: "links-request",
          linkRequests: [], // Will be populated by transcript analysis
        },
        dependencies: [codeRequestId],
        status: "requires-user-input",
      },
      // 5. Article generation (depends on links request and code request)
      {
        id: articleGenerationId,
        createdAt: Date.now(),
        action: {
          type: "generate-article-from-transcript",
          transcriptPath,
          originalVideoPath,
          linksDependencyId: linksRequestId,
          codeDependencyId: codeRequestId,
        },
        dependencies: [linksRequestId, codeRequestId],
        status: "ready-to-run",
      }
    );
  }

  return queueItems;
});