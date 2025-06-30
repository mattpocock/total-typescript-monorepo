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

  it("should return the first idle item when no dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "idle"),
        createQueueItem("3", "idle"),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toEqual(queueState.queue[1]);
  });

  it("should return requires-user-input item when hasUserInput is true", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "requires-user-input"),
        createQueueItem("3", "idle"),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: true });

    expect(result).toEqual(queueState.queue[1]);
  });

  it("should not return requires-user-input item when hasUserInput is false", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "requires-user-input"),
        createQueueItem("3", "idle"),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toEqual(queueState.queue[2]);
  });

  it("should return item with satisfied dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "idle", ["1"]),
        createQueueItem("3", "idle", ["1", "2"]),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toEqual(queueState.queue[1]);
  });

  it("should not return item with unsatisfied dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "idle"),
        createQueueItem("2", "idle", ["1"]),
        createQueueItem("3", "idle", ["1", "2"]),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toEqual(queueState.queue[0]);
  });

  it("should not return item with failed dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "failed"),
        createQueueItem("2", "idle", ["1"]),
        createQueueItem("3", "idle"),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toEqual(queueState.queue[2]);
  });

  it("should not return item with requires-user-input dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "requires-user-input"),
        createQueueItem("2", "idle", ["1"]),
        createQueueItem("3", "idle"),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toEqual(queueState.queue[2]);
  });

  it("should return item with multiple satisfied dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "completed"),
        createQueueItem("3", "idle", ["1", "2"]),
        createQueueItem("4", "idle"),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

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

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toBeUndefined();
  });

  it("should return null when all items have unsatisfied dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "idle", ["2"]),
        createQueueItem("2", "idle", ["1"]),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toBeUndefined();
  });

  it("should return null for empty queue", () => {
    const queueState: QueueState = {
      queue: [],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toBeUndefined();
  });

  it("should handle items with undefined dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "idle"),
        createQueueItem("2", "idle", undefined),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toEqual(queueState.queue[0]);
  });

  it("should handle items with empty dependencies array", () => {
    const queueState: QueueState = {
      queue: [createQueueItem("1", "idle"), createQueueItem("2", "idle", [])],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toEqual(queueState.queue[0]);
  });

  it("should handle missing dependency items gracefully", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "idle", ["missing-id"]),
        createQueueItem("2", "idle"),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toEqual(queueState.queue[1]);
  });

  it("should handle complex dependency chains", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "completed", ["1"]),
        createQueueItem("3", "idle", ["2"]),
        createQueueItem("4", "idle", ["1", "3"]),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toEqual(queueState.queue[2]);
  });

  it("should handle mixed status items with dependencies", () => {
    const queueState: QueueState = {
      queue: [
        createQueueItem("1", "completed"),
        createQueueItem("2", "failed", ["1"]),
        createQueueItem("3", "idle", ["1", "2"]),
        createQueueItem("4", "idle", ["1"]),
      ],
    };

    const result = getNextQueueItem(queueState, { hasUserInput: false });

    expect(result).toEqual(queueState.queue[3]);
  });
});
