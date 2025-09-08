import { FileSystem } from "@effect/platform";
import { Config, Effect } from "effect";
import type { QueueItem } from "./queue.js";
import { NodeFileSystem } from "@effect/platform-node";

export type QueueState = {
  queue: QueueItem[];
};

const defaultQueueState: QueueState = {
  queue: [],
};

export class QueueUpdaterService extends Effect.Service<QueueUpdaterService>()(
  "QueueUpdaterService",
  {
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const fsQueueSemaphore = yield* Effect.makeSemaphore(1);

      const queueLocation = yield* Config.string("QUEUE_LOCATION");

      const writeToQueue = (items: QueueItem[]) => {
        return Effect.gen(function* () {
          yield* ensureQueueExists();
          const existingQueue = yield* fsQueueSemaphore.withPermits(1)(
            fs.readFileString(queueLocation)
          );
          const queueState = JSON.parse(existingQueue) as QueueState;

          queueState.queue.push(...items);

          yield* fsQueueSemaphore.withPermits(1)(
            fs.writeFileString(
              queueLocation,
              JSON.stringify(queueState, null, 2)
            )
          );
        });
      };

      const getQueueState = () => {
        return Effect.gen(function* () {
          yield* ensureQueueExists();
          const existingQueue = yield* fsQueueSemaphore.withPermits(1)(
            fs.readFileString(queueLocation)
          );
          const queueState = JSON.parse(existingQueue) as QueueState;

          return queueState;
        });
      };

      const updateQueueItem = (item: QueueItem) => {
        return Effect.gen(function* () {
          yield* ensureQueueExists();

          const queueState = yield* getQueueState();
          const index = queueState.queue.findIndex((i) => i.id === item.id);
          queueState.queue[index] = item;
          yield* fsQueueSemaphore.withPermits(1)(
            fs.writeFileString(
              queueLocation,
              JSON.stringify(queueState, null, 2)
            )
          );
        });
      };

      const ensureQueueExists = () => {
        return Effect.gen(function* () {
          const exists = yield* fs.exists(queueLocation);

          if (!exists) {
            yield* fsQueueSemaphore.withPermits(1)(
              fs.writeFileString(
                queueLocation,
                JSON.stringify(defaultQueueState, null, 2)
              )
            );
          }
        });
      };

      return {
        writeToQueue,
        getQueueState,
        updateQueueItem,
      };
    }),
    dependencies: [NodeFileSystem.layer],
  }
) {}
