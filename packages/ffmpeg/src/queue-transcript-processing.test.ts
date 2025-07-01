import { FileSystem } from "@effect/platform";
import type { AbsolutePath } from "@total-typescript/shared";
import { fromPartial } from "@total-typescript/shoehorn";
import { Effect } from "effect";
import { expect, it, vi } from "vitest";
import {
  DependentLinksRequestNotFoundError,
  processTranscriptAnalysisForQueue,
} from "./queue-transcript-processing.js";
import type { QueueItem, QueueState } from "./queue/queue.js";
import { AIService } from "./services.js";

it("Should update existing links-request item with generated link requests", async () => {
  const mockUpdateQueueItem = vi.fn().mockReturnValue(Effect.succeed(void 0));

  const transcriptAnalysisItem: QueueItem & {
    action: {
      type: "analyze-transcript-for-links";
      transcriptPath: AbsolutePath;
      originalVideoPath: AbsolutePath;
    };
  } = {
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
    Effect.provideService(
      FileSystem.FileSystem,
      FileSystem.makeNoop({
        readFileString: vi
          .fn()
          .mockReturnValue(Effect.succeed("Test Transcript")),
      })
    ),
    Effect.provideService(
      AIService,
      new AIService(
        fromPartial({
          askForLinks: vi
            .fn()
            .mockReturnValue(
              Effect.succeed(["Documentation link", "TypeScript handbook"])
            ),
        })
      )
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
  const mockUpdateQueueItem = vi.fn().mockReturnValue(Effect.succeed(void 0));

  const transcriptAnalysisItem: QueueItem & {
    action: {
      type: "analyze-transcript-for-links";
      transcriptPath: AbsolutePath;
      originalVideoPath: AbsolutePath;
    };
  } = {
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
    Effect.provideService(
      FileSystem.FileSystem,
      FileSystem.makeNoop({
        readFileString: vi
          .fn()
          .mockReturnValue(Effect.succeed("Test Transcript")),
      })
    ),
    Effect.provideService(
      AIService,
      new AIService(
        fromPartial({
          askForLinks: vi.fn().mockReturnValue(Effect.succeed([])),
        })
      )
    ),
    Effect.runPromise
  );

  expect(result).toEqual([]);
  expect(mockUpdateQueueItem).not.toHaveBeenCalled();
});

it("Should fail when no dependent links-request item is found", async () => {
  const mockUpdateQueueItem = vi.fn().mockReturnValue(Effect.succeed(void 0));

  const transcriptAnalysisItem: QueueItem & {
    action: {
      type: "analyze-transcript-for-links";
      transcriptPath: AbsolutePath;
      originalVideoPath: AbsolutePath;
    };
  } = {
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
    Effect.provideService(
      FileSystem.FileSystem,
      FileSystem.makeNoop({
        readFileString: vi
          .fn()
          .mockReturnValue(Effect.succeed("Test Transcript")),
      })
    ),
    Effect.provideService(
      AIService,
      new AIService(
        fromPartial({
          askForLinks: vi
            .fn()
            .mockReturnValue(Effect.succeed(["Documentation link"])),
        })
      )
    ),
    Effect.flip,
    Effect.runPromise
  );

  expect(result).toBeInstanceOf(DependentLinksRequestNotFoundError);
  expect((result as any).transcriptAnalysisItemId).toBe("analysis-1");
  expect(mockUpdateQueueItem).not.toHaveBeenCalled();
});

it("Should find the correct dependent links-request item when multiple exist", async () => {
  const mockUpdateQueueItem = vi.fn().mockReturnValue(Effect.succeed(void 0));

  const transcriptAnalysisItem: QueueItem & {
    action: {
      type: "analyze-transcript-for-links";
      transcriptPath: AbsolutePath;
      originalVideoPath: AbsolutePath;
    };
  } = {
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
    queue: [
      transcriptAnalysisItem,
      unrelatedLinksRequestItem,
      correctLinksRequestItem,
    ],
  };

  await processTranscriptAnalysisForQueue({
    queueItem: transcriptAnalysisItem,
    queueState,
    updateQueueItem: mockUpdateQueueItem,
  }).pipe(
    Effect.provideService(
      FileSystem.FileSystem,
      FileSystem.makeNoop({
        readFileString: vi
          .fn()
          .mockReturnValue(Effect.succeed("Test Transcript")),
      })
    ),
    Effect.provideService(
      AIService,
      new AIService(
        fromPartial({
          askForLinks: vi
            .fn()
            .mockReturnValue(Effect.succeed(["Documentation link"])),
        })
      )
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
