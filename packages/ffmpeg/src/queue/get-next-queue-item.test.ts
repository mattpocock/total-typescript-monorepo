import { describe, it, expect } from "vitest";
import { getNextQueueItem } from "./queue.js";
import type { QueueState, QueueItem } from "./queue.js";

describe("getNextQueueItem", () => {
  const createQueueItem = (
    id: string,
    status: QueueItem["status"],
    dependencies?: string[]
  ): QueueItem => ({
    id,
    createdAt: Date.now(),
    action: {
      type: "create-auto-edited-video",
      inputVideo: "/path/to/video.mp4" as any,
      videoName: "test-video",
      subtitles: false,
      dryRun: true,
    },
    status,
    dependencies,
  });

  it("should return the first ready-to-run item when no dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "ready-to-run"),
        createQueueItem("3", "ready-to-run"),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[1]);
  });

  it("should skip requires-user-input items", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "requires-user-input"),
        createQueueItem("3", "ready-to-run"),
      ],
    };

    const result = getNextQueueItem(queueState);

    // Should skip the requires-user-input item and return the ready-to-run item
    expect(result).toEqual(queueState.queue[2]);
  });

  it("should not return requires-user-input item", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "requires-user-input"),
        createQueueItem("3", "ready-to-run"),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[2]);
  });

  it("should return item with satisfied dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "ready-to-run", ["1"]),
        createQueueItem("3", "ready-to-run", ["1", "2"]),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[1]);
  });

  it("should not return item with unsatisfied dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "ready-to-run"),
        createQueueItem("2", "ready-to-run", ["1"]),
        createQueueItem("3", "ready-to-run", ["1", "2"]),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[0]);
  });

  it("should not return item with failed dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "failed"),
        createQueueItem("2", "ready-to-run", ["1"]),
        createQueueItem("3", "ready-to-run"),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[2]);
  });

  it("should not return item with requires-user-input dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "requires-user-input"),
        createQueueItem("2", "ready-to-run", ["1"]),
        createQueueItem("3", "ready-to-run"),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[2]);
  });

  it("should return item with multiple satisfied dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "completed"),
        createQueueItem("3", "ready-to-run", ["1", "2"]),
        createQueueItem("4", "ready-to-run"),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[2]);
  });

  it("should return null when no items can be processed", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "failed"),
        createQueueItem("3", "requires-user-input"),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toBeUndefined();
  });

  it("should return null when all items have unsatisfied dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "ready-to-run", ["2"]),
        createQueueItem("2", "ready-to-run", ["1"]),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toBeUndefined();
  });

  it("should return null for empty queue", () => {
    const queueState: QueueState = {
      queue: [],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toBeUndefined();
  });

  it("should handle items with undefined dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "ready-to-run"),
        createQueueItem("2", "ready-to-run", undefined),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[0]);
  });

  it("should handle items with empty dependencies array", () => {
    const queueState: QueueState = {
      queue: [createQueueItem("1", "ready-to-run"), createQueueItem("2", "ready-to-run", [])],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[0]);
  });

  it("should handle missing dependency items gracefully", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "ready-to-run", ["missing-id"]),
        createQueueItem("2", "ready-to-run"),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[1]);
  });

  it("should handle complex dependency chains", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "completed", ["1"]),
        createQueueItem("3", "ready-to-run", ["2"]),
        createQueueItem("4", "ready-to-run", ["1", "3"]),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[2]);
  });

  it("should handle mixed status items with dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "failed", ["1"]),
        createQueueItem("3", "ready-to-run", ["1", "2"]),
        createQueueItem("4", "ready-to-run", ["1"]),
      ],
    };

    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[3]);
  });

  it("should skip links-request items (information requests)", () => {
    const queueState: QueueState = {
      queue: [
        {
          id: "1",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["test"],
          },
          status: "requires-user-input",
        },
        createQueueItem("2", "ready-to-run"),
      ],
    };

    // Should skip the links-request item (requires-user-input status)
    const result = getNextQueueItem(queueState);

    expect(result).toEqual(queueState.queue[1]);
  });

  it("should return undefined when only links-request items are available", () => {
    const queueState: QueueState = {
      queue: [
        {
          id: "1",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["test"],
          },
          status: "requires-user-input",
        },
        {
          id: "2",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["test2"],
          },
          status: "requires-user-input",
        },
      ],
    };

    // Should return undefined since all items have requires-user-input status
    const result = getNextQueueItem(queueState);

    expect(result).toBeUndefined();
  });
});
