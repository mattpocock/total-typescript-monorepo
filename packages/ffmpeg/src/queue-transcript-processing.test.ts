import type { AbsolutePath } from "@total-typescript/shared";
import { Effect } from "effect";
import { expect, it, vi } from "vitest";
import {
  DependentLinksRequestNotFoundError,
  processTranscriptAnalysisForQueue,
} from "./queue-transcript-processing.js";
import type { QueueItem, QueueState } from "./queue/queue.js";

it("Should update existing links-request item with generated link requests", async () => {
  const mockAnalyzeTranscriptForLinks = vi.fn().mockReturnValue(
    Effect.succeed(["Documentation link", "TypeScript handbook"])
  );

  const mockUpdateQueueItem = vi.fn().mockReturnValue(Effect.succeed(void 0));

  const transcriptAnalysisItem: QueueItem = {
    id: "analysis-1",
    createdAt: Date.now(),
    action: {
      type: "analyze-transcript-for-links",
      transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
      originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
    },
    status: "ready-to-run",
  };

  const linksRequestItem: QueueItem = {
    id: "links-1",
    createdAt: Date.now(),
    action: {
      type: "links-request",
      linkRequests: [],
    },
    dependencies: ["analysis-1"],
    status: "ready-to-run",
  };

  const queueState: QueueState = {
    queue: [transcriptAnalysisItem, linksRequestItem],
  };

  await processTranscriptAnalysisForQueue({
    queueItem: transcriptAnalysisItem,
    queueState,
    updateQueueItem: mockUpdateQueueItem,
  }).pipe(
    Effect.provide(
      Effect.provideService("analyzeTranscriptForLinks", mockAnalyzeTranscriptForLinks)
    ),
    Effect.runPromise
  );

  expect(mockUpdateQueueItem).toHaveBeenCalledWith({
    ...linksRequestItem,
    action: {
      type: "links-request",
      linkRequests: ["Documentation link", "TypeScript handbook"],
    },
    status: "requires-user-input",
  });
});

it("Should handle empty link requests gracefully", async () => {
  const mockAnalyzeTranscriptForLinks = vi.fn().mockReturnValue(
    Effect.succeed([])
  );

  const mockUpdateQueueItem = vi.fn().mockReturnValue(Effect.succeed(void 0));

  const transcriptAnalysisItem: QueueItem = {
    id: "analysis-1",
    createdAt: Date.now(),
    action: {
      type: "analyze-transcript-for-links",
      transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
      originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
    },
    status: "ready-to-run",
  };

  const queueState: QueueState = {
    queue: [transcriptAnalysisItem],
  };

  const result = await processTranscriptAnalysisForQueue({
    queueItem: transcriptAnalysisItem,
    queueState,
    updateQueueItem: mockUpdateQueueItem,
  }).pipe(
    Effect.provide(
      Effect.provideService("analyzeTranscriptForLinks", mockAnalyzeTranscriptForLinks)
    ),
    Effect.runPromise
  );

  expect(result).toEqual([]);
  expect(mockUpdateQueueItem).not.toHaveBeenCalled();
});

it("Should fail when no dependent links-request item is found", async () => {
  const mockAnalyzeTranscriptForLinks = vi.fn().mockReturnValue(
    Effect.succeed(["Documentation link"])
  );

  const mockUpdateQueueItem = vi.fn().mockReturnValue(Effect.succeed(void 0));

  const transcriptAnalysisItem: QueueItem = {
    id: "analysis-1",
    createdAt: Date.now(),
    action: {
      type: "analyze-transcript-for-links",
      transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
      originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
    },
    status: "ready-to-run",
  };

  // Queue state with no dependent links-request item
  const queueState: QueueState = {
    queue: [transcriptAnalysisItem],
  };

  const result = await processTranscriptAnalysisForQueue({
    queueItem: transcriptAnalysisItem,
    queueState,
    updateQueueItem: mockUpdateQueueItem,
  }).pipe(
    Effect.provide(
      Effect.provideService("analyzeTranscriptForLinks", mockAnalyzeTranscriptForLinks)
    ),
    Effect.flip
  );

  expect(result).toBeInstanceOf(DependentLinksRequestNotFoundError);
  expect(result.transcriptAnalysisItemId).toBe("analysis-1");
  expect(mockUpdateQueueItem).not.toHaveBeenCalled();
});

it("Should find the correct dependent links-request item when multiple exist", async () => {
  const mockAnalyzeTranscriptForLinks = vi.fn().mockReturnValue(
    Effect.succeed(["Documentation link"])
  );

  const mockUpdateQueueItem = vi.fn().mockReturnValue(Effect.succeed(void 0));

  const transcriptAnalysisItem: QueueItem = {
    id: "analysis-1",
    createdAt: Date.now(),
    action: {
      type: "analyze-transcript-for-links",
      transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
      originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
    },
    status: "ready-to-run",
  };

  const unrelatedLinksRequestItem: QueueItem = {
    id: "links-unrelated",
    createdAt: Date.now(),
    action: {
      type: "links-request",
      linkRequests: [],
    },
    dependencies: ["other-analysis"],
    status: "ready-to-run",
  };

  const correctLinksRequestItem: QueueItem = {
    id: "links-1",
    createdAt: Date.now(),
    action: {
      type: "links-request",
      linkRequests: [],
    },
    dependencies: ["analysis-1"],
    status: "ready-to-run",
  };

  const queueState: QueueState = {
    queue: [transcriptAnalysisItem, unrelatedLinksRequestItem, correctLinksRequestItem],
  };

  await processTranscriptAnalysisForQueue({
    queueItem: transcriptAnalysisItem,
    queueState,
    updateQueueItem: mockUpdateQueueItem,
  }).pipe(
    Effect.provide(
      Effect.provideService("analyzeTranscriptForLinks", mockAnalyzeTranscriptForLinks)
    ),
    Effect.runPromise
  );

  expect(mockUpdateQueueItem).toHaveBeenCalledWith({
    ...correctLinksRequestItem,
    action: {
      type: "links-request",
      linkRequests: ["Documentation link"],
    },
    status: "requires-user-input",
  });
});

it("Should propagate transcript analysis errors", async () => {
  const transcriptError = new Error("Transcript analysis failed");
  const mockAnalyzeTranscriptForLinks = vi.fn().mockReturnValue(
    Effect.fail(transcriptError)
  );

  const mockUpdateQueueItem = vi.fn().mockReturnValue(Effect.succeed(void 0));

  const transcriptAnalysisItem: QueueItem = {
    id: "analysis-1",
    createdAt: Date.now(),
    action: {
      type: "analyze-transcript-for-links",
      transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
      originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
    },
    status: "ready-to-run",
  };

  const queueState: QueueState = {
    queue: [transcriptAnalysisItem],
  };

  const result = await processTranscriptAnalysisForQueue({
    queueItem: transcriptAnalysisItem,
    queueState,
    updateQueueItem: mockUpdateQueueItem,
  }).pipe(
    Effect.provide(
      Effect.provideService("analyzeTranscriptForLinks", mockAnalyzeTranscriptForLinks)
    ),
    Effect.flip
  );

  expect(result).toBe(transcriptError);
  expect(mockUpdateQueueItem).not.toHaveBeenCalled();
});