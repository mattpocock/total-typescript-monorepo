import { NodeFileSystem } from "@effect/platform-node";
import type { AbsolutePath } from "@total-typescript/shared";
import { ConfigProvider, Effect, Layer } from "effect";
import * as fs from "node:fs/promises";
import path from "node:path";
import { expect, it, vi } from "vitest";
import { processQueue, writeToQueue } from "./queue.js";
import { WorkflowsService } from "../workflows.js";

it("Should create the queue.json if it does not exist", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");

    const createAutoEditedVideoWorkflow = vi.fn();

    await processQueue().pipe(
      Effect.provideService(
        WorkflowsService,
        new WorkflowsService({
          createAutoEditedVideoWorkflow,
        })
      ),
      Effect.provide(NodeFileSystem.layer),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          QUEUE_LOCATION,
          QUEUE_LOCKFILE_LOCATION,
        })
      ),
      Effect.runPromise
    );

    expect(createAutoEditedVideoWorkflow).not.toHaveBeenCalled();

    const queueState = JSON.parse(
      (await fs.readFile(QUEUE_LOCATION, "utf-8")).toString()
    );

    expect(queueState.queue).toEqual([]);
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

it("Should update the queue.json when a new item is added", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");

    const createAutoEditedVideoWorkflow = vi
      .fn()
      .mockReturnValue(Effect.succeed(undefined));

    await Effect.gen(function* () {
      yield* writeToQueue([
        {
          id: "1",
          createdAt: Date.now(),
          action: {
            type: "create-auto-edited-video",
            inputVideo: "/Users/josh/Desktop/video.mp4" as AbsolutePath,
            videoName: "test",
            subtitles: false,
            dryRun: false,
          },
          status: "idle",
        },
      ]);
    }).pipe(
      Effect.provide(NodeFileSystem.layer),
      Effect.provideService(
        WorkflowsService,
        new WorkflowsService({
          createAutoEditedVideoWorkflow,
        })
      ),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          QUEUE_LOCATION,
          QUEUE_LOCKFILE_LOCATION,
        })
      ),
      Effect.runPromise
    );

    const queueState = JSON.parse(
      (await fs.readFile(QUEUE_LOCATION, "utf-8")).toString()
    );

    expect(queueState.queue).toEqual([
      {
        id: "1",
        createdAt: expect.any(Number),
        action: {
          type: "create-auto-edited-video",
          inputVideo: "/Users/josh/Desktop/video.mp4" as AbsolutePath,
          videoName: "test",
          subtitles: false,
          dryRun: false,
        },
        status: "idle",
      },
    ]);
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});
