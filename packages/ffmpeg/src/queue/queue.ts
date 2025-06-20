import { FileSystem } from "@effect/platform/FileSystem";
import { type AbsolutePath } from "@total-typescript/shared";
import { Config, Context, Effect } from "effect";
import type { createAutoEditedVideoWorkflow } from "../workflows.js";

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

const ensureQueueExists = () => {
  return Effect.gen(function* () {
    const queueLocation = yield* Config.string("QUEUE_LOCATION");
    const fs = yield* FileSystem;
    const exists = yield* fs.exists(queueLocation);

    if (!exists) {
      yield* fs.writeFileString(
        queueLocation,
        JSON.stringify(defaultQueueState)
      );
    }
  });
};

export const writeToQueue = (items: QueueItem[]) => {
  return Effect.gen(function* () {
    yield* ensureQueueExists();
    const queueLocation = yield* Config.string("QUEUE_LOCATION");
    const fs = yield* FileSystem;
    const existingQueue = yield* fs.readFileString(queueLocation);
    const queueState = JSON.parse(existingQueue) as QueueState;

    queueState.queue.push(...items);

    yield* fs.writeFileString(
      queueLocation,
      JSON.stringify(queueState, null, 2)
    );
  });
};

export const getQueueState = () => {
  return Effect.gen(function* () {
    yield* ensureQueueExists();
    const queueLocation = yield* Config.string("QUEUE_LOCATION");
    const fs = yield* FileSystem;
    const existingQueue = yield* fs.readFileString(queueLocation);
    const queueState = JSON.parse(existingQueue) as QueueState;

    return queueState;
  });
};

const updateQueueItem = (item: QueueItem) => {
  return Effect.gen(function* () {
    yield* ensureQueueExists();
    const queueLocation = yield* Config.string("QUEUE_LOCATION");
    const fs = yield* FileSystem;

    const queueState = yield* getQueueState();
    const index = queueState.queue.findIndex((i) => i.id === item.id);
    queueState.queue[index] = item;
    yield* fs.writeFileString(queueLocation, JSON.stringify(queueState));
  });
};

const writeQueueLockfile = () => {
  return Effect.gen(function* () {
    const queueLockfileLocation = yield* Config.string(
      "QUEUE_LOCKFILE_LOCATION"
    );
    const fs = yield* FileSystem;
    yield* fs.writeFileString(queueLockfileLocation, "");
  });
};

export const doesQueueLockfileExist = () => {
  return Effect.gen(function* () {
    const queueLockfileLocation = yield* Config.string(
      "QUEUE_LOCKFILE_LOCATION"
    );
    const fs = yield* FileSystem;
    const exists = yield* fs.exists(queueLockfileLocation);

    return exists;
  });
};

const deleteQueueLockfile = () => {
  return Effect.gen(function* () {
    const queueLockfileLocation = yield* Config.string(
      "QUEUE_LOCKFILE_LOCATION"
    );
    const fs = yield* FileSystem;
    yield* fs.remove(queueLockfileLocation);
  });
};

export class QueueRunnerService extends Context.Tag("QueueRunnerService")<
  QueueRunnerService,
  {
    createAutoEditedVideoWorkflow: (
      params: Parameters<typeof createAutoEditedVideoWorkflow>[0]
    ) => Effect.Effect<
      AbsolutePath,
      Effect.Effect.Error<ReturnType<typeof createAutoEditedVideoWorkflow>>
    >;
  }
>() {}

export const processQueue = () => {
  return Effect.gen(function* () {
    if (yield* doesQueueLockfileExist()) {
      return Effect.succeed("Queue is locked, skipping");
    }

    yield* writeQueueLockfile();

    const queueRunners = yield* QueueRunnerService;

    const queueState = yield* getQueueState();
    const queueItem = queueState.queue.find((i) => i.status === "idle");

    if (!queueItem) {
      return Effect.succeed("No idle queue items found");
    }

    switch (queueItem.action.type) {
      case "create-auto-edited-video":
        yield* queueRunners
          .createAutoEditedVideoWorkflow({
            subtitles: queueItem.action.subtitles,
            dryRun: queueItem.action.dryRun,
          })
          .pipe(
            Effect.match({
              onSuccess: () => {
                return updateQueueItem({
                  ...queueItem,
                  status: "completed",
                  completedAt: Date.now(),
                });
              },
              onFailure: (error) => {
                return updateQueueItem({
                  ...queueItem,
                  status: "failed",
                  error: error.message,
                });
              },
            })
          );

        break;
      default:
        return Effect.succeed("Unknown queue item type");
    }

    return Effect.succeed("Queue item processed");
  }).pipe(
    Effect.ensuring(
      deleteQueueLockfile().pipe(
        // Fail silently
        Effect.catchAll(() => Effect.succeed(undefined))
      )
    )
  );
};
