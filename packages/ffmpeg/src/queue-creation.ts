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
  alongside?: boolean;
  codeContent?: string;
  codePath?: string;
}

export const createAutoEditedVideoQueueItems = Effect.fn(
  "createAutoEditedVideoQueueItems"
)(function* (opts: CreateAutoEditedVideoQueueItemsOptions) {
  const { inputVideo, videoName, subtitles, dryRun, generateArticle, alongside, codeContent, codePath } = opts;

  // Get environment configuration
  const transcriptionDirectory = yield* Config.string(
    "TRANSCRIPTION_DIRECTORY"
  );
  const obsOutputDirectory = yield* Config.string("OBS_OUTPUT_DIRECTORY");

  // Generate unique IDs for all queue items
  const videoId = crypto.randomUUID();
  const transcriptAnalysisId = crypto.randomUUID();
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
    const inputVideoName = path.parse(inputVideo).name;

    // Get the transcript path that will be created by the video processing
    const transcriptPath = path.join(
      transcriptionDirectory,
      `${inputVideoName}.txt`
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
      // 3. Links request (depends on transcript analysis) - NO LONGER depends on code request
      {
        id: linksRequestId,
        createdAt: Date.now(),
        action: {
          type: "links-request",
          linkRequests: [], // Will be populated by transcript analysis
        },
        dependencies: [transcriptAnalysisId],
        status: "requires-user-input",
      },
      // 4. Article generation (depends on links request) - now includes code directly
      {
        id: articleGenerationId,
        createdAt: Date.now(),
        action: {
          type: "generate-article-from-transcript",
          transcriptPath,
          originalVideoPath,
          linksDependencyId: linksRequestId,
          videoName,
          dryRun,
          alongside: Boolean(alongside),
          codeContent: codeContent || "",
          codePath: codePath || "",
        },
        dependencies: [linksRequestId],
        status: "ready-to-run",
      }
    );
  }

  return queueItems;
});
