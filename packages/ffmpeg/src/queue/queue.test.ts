import type { AbsolutePath } from "@total-typescript/shared";
import { fromPartial } from "@total-typescript/shoehorn";
import * as fs from "node:fs/promises";
import path from "node:path";
import { expect, it, vitest } from "vitest";
import type { Context } from "../types.js";
import { processQueue, writeToQueue } from "./queue.js";

const { okAsync } = await vitest.hoisted(async () => ({
  okAsync: await import("neverthrow").then((m) => m.okAsync),
}));

it("Should create the queue.json if it does not exist", async () => {
  // Mock createAutoEditedVideoWorkflow
  vitest.mock("../workflows.js", () => ({
    createAutoEditedVideoWorkflow: vitest
      .fn()
      .mockResolvedValue(okAsync(undefined)),
  }));
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));
  try {
    const ctx: Context = fromPartial({
      queueLocation: path.join(tmpDir, "queue.json"),
      queueLockfileLocation: path.join(tmpDir, "queue.lock"),
      fs,
    });

    await expect(processQueue(ctx)).resolves.not.toThrow();

    expect(await fs.readFile(ctx.queueLocation, "utf-8")).toBeTypeOf("string");
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

it("Should update the queue.json when a new item is added", async () => {
  // Mock createAutoEditedVideoWorkflow
  vitest.mock("../workflows.js", () => ({
    createAutoEditedVideoWorkflow: vitest
      .fn()
      .mockResolvedValue(okAsync(undefined)),
  }));

  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));
  const queueLocation = path.join(tmpDir, "queue.json");
  try {
    const ctx: Context = fromPartial({
      queueLocation,
      queueLockfileLocation: path.join(tmpDir, "queue.lock"),
      fs,
    });

    await writeToQueue(
      [
        {
          id: "1",
          createdAt: Date.now(),
          action: {
            type: "create-auto-edited-video",
            inputVideo: "test.mp4" as AbsolutePath,
            videoName: "Test",
            subtitles: false,
            dryRun: false,
          },
          status: "idle",
        },
      ],
      ctx
    );

    await expect(processQueue(ctx)).resolves.not.toThrow();

    const queueState = JSON.parse(
      (await fs.readFile(ctx.queueLocation, "utf-8")).toString()
    );

    expect(queueState.queue).toEqual([
      {
        status: "completed",
        completedAt: expect.any(Number),
        createdAt: expect.any(Number),
        id: "1",
        action: {
          type: "create-auto-edited-video",
          inputVideo: "test.mp4",
          videoName: "Test",
          subtitles: false,
          dryRun: false,
        },
      },
    ]);
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});
