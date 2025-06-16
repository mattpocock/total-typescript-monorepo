import { exists, type AbsolutePath } from "@total-typescript/shared";
import { okAsync } from "neverthrow";
import type { Context } from "../types.js";
import { createAutoEditedVideoWorkflow } from "../workflows.js";

export type QueueItemAction = {
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
};

export type QueueItem = {
  id: string;
  createdAt: number;
  completedAt?: number;
  action: QueueItemAction;
  status: "idle" | "completed" | "failed";
  error?: string;
};

export type QueueState = {
  queue: QueueItem[];
};

const defaultQueueState: QueueState = {
  queue: [],
};

const ensureQueueExists = async (ctx: Context) => {
  if (!(await exists(ctx.queueLocation))) {
    await ctx.fs.writeFile(
      ctx.queueLocation,
      JSON.stringify(defaultQueueState)
    );
  }
};

export const writeToQueue = async (items: QueueItem[], ctx: Context) => {
  await ensureQueueExists(ctx);
  const existingQueue = await ctx.fs.readFile(ctx.queueLocation);
  const queueState = JSON.parse(existingQueue.toString()) as QueueState;

  queueState.queue.push(...items);

  await ctx.fs.writeFile(ctx.queueLocation, JSON.stringify(queueState));
};

export const getQueueState = async (ctx: Context) => {
  await ensureQueueExists(ctx);
  const existingQueue = await ctx.fs.readFile(ctx.queueLocation);
  const queueState = JSON.parse(existingQueue.toString()) as QueueState;

  return queueState;
};

const updateQueueItem = async (item: QueueItem, ctx: Context) => {
  await ensureQueueExists(ctx);
  const queueState = await getQueueState(ctx);
  const index = queueState.queue.findIndex((i) => i.id === item.id);
  queueState.queue[index] = item;
  await ctx.fs.writeFile(ctx.queueLocation, JSON.stringify(queueState));
};

const writeQueueLockfile = async (ctx: Context) => {
  await ctx.fs.writeFile(ctx.queueLockfileLocation, "");
};

const doesLockfileExist = async (ctx: Context) => {
  return await exists(ctx.queueLockfileLocation);
};

const deleteQueueLockfile = async (ctx: Context) => {
  await ctx.fs.unlink(ctx.queueLockfileLocation);
};

export const processQueue = async (ctx: Context) => {
  if (await doesLockfileExist(ctx)) {
    console.log("Queue is locked, skipping");
    return;
  }

  await writeQueueLockfile(ctx);

  const cleanup = async () => {
    try {
      await deleteQueueLockfile(ctx);
    } catch (e) {
      // Ignore cleanup errors
    }
  };

  // Handle normal process exit
  process.on("beforeExit", cleanup);

  // Handle termination signals
  process.on("SIGTERM", async () => {
    await cleanup();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    await cleanup();
    process.exit(0);
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", async (error) => {
    console.error("Uncaught exception:", error);
    await cleanup();
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", async (reason) => {
    console.error("Unhandled rejection:", reason);
    await cleanup();
    process.exit(1);
  });

  while (true) {
    const queueState = await getQueueState(ctx);
    const queueItem = queueState.queue.find((i) => i.status === "idle");

    if (!queueItem) {
      break;
    }

    switch (queueItem.action.type) {
      case "create-auto-edited-video":
        const result = await createAutoEditedVideoWorkflow({
          ctx,
          getLatestVideo: () => okAsync(queueItem.action.inputVideo),
          promptForFilename: () => Promise.resolve(queueItem.action.videoName),
          subtitles: queueItem.action.subtitles,
          dryRun: queueItem.action.dryRun,
        });

        if (result.isErr()) {
          console.error(result.error);
          await updateQueueItem(
            {
              ...queueItem,
              status: "failed",
              error:
                result.error instanceof Error
                  ? result.error.message
                  : String(result.error),
            },
            ctx
          );
        } else {
          await updateQueueItem(
            {
              ...queueItem,
              status: "completed",
              completedAt: Date.now(),
            },
            ctx
          );
        }
        break;
    }
  }

  process.exit(0);
};
