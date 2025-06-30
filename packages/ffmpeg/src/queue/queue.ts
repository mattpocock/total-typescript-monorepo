import { FileSystem } from "@effect/platform/FileSystem";
import { type AbsolutePath } from "@total-typescript/shared";
import { Config, Console, Effect, Either } from "effect";
import { AskQuestionService, LinksStorageService } from "../services.js";
import { WorkflowsService } from "../workflows.js";

export type QueueItemAction =
  | {
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
    }
  | {
      /**
       * A request for the user to provide links
       * that the transcript editor uses to
       * find the relevant content.
       */
      type: "links-request";
      linkRequests: string[];
    };

export type QueueItem = {
  id: string;
  createdAt: number;
  completedAt?: number;
  action: QueueItemAction;
  /**
   * An array of queue item ids that must be completed
   * before this item can be processed.
   */
  dependencies?: string[];
  status: "idle" | "completed" | "failed" | "requires-user-input";
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

export const getNextQueueItem = (
  queueState: QueueState,
  opts: { hasUserInput: boolean }
) => {
  const queueItemsAsMap = new Map(queueState.queue.map((i) => [i.id, i]));
  return queueState.queue.find((i) => {
    const canBeRun =
      i.status === "idle" ||
      (opts.hasUserInput && i.status === "requires-user-input");

    const dependenciesAreMet =
      !i.dependencies ||
      i.dependencies.every(
        (dependency) => queueItemsAsMap.get(dependency)?.status === "completed"
      );

    return canBeRun && dependenciesAreMet;
  });
};

export const processQueue = (opts: { hasUserInput: boolean }) => {
  return Effect.gen(function* () {
    if (yield* doesQueueLockfileExist()) {
      return yield* Console.log("Queue is locked, skipping");
    }

    yield* writeQueueLockfile();

    const workflows = yield* WorkflowsService;
    const askQuestion = yield* AskQuestionService;
    const linkStorage = yield* LinksStorageService;

    while (true) {
      const queueState = yield* getQueueState();
      const queueItem = queueState.queue.find(
        (i) =>
          i.status === "idle" ||
          (opts.hasUserInput && i.status === "requires-user-input")
      );

      if (!queueItem) {
        return yield* Console.log("No idle queue items found");
      }

      switch (queueItem.action.type) {
        case "create-auto-edited-video":
          const result = yield* workflows
            .createAutoEditedVideoWorkflow({
              inputVideo: queueItem.action.inputVideo,
              outputFilename: queueItem.action.videoName,
              subtitles: queueItem.action.subtitles,
              dryRun: queueItem.action.dryRun,
            })
            .pipe(Effect.either);

          if (Either.isLeft(result)) {
            yield* Effect.logError(result.left);
            yield* updateQueueItem({
              ...queueItem,
              status: "failed",
              error: result.left.message,
            });
            continue;
          }

          yield* updateQueueItem({
            ...queueItem,
            status: "completed",
            completedAt: Date.now(),
          });

          break;
        case "links-request":
          const links: { description: string; url: string }[] = [];
          for (const linkRequest of queueItem.action.linkRequests) {
            const link = yield* askQuestion.askQuestion(
              `Link request: ${linkRequest}`
            );

            links.push({
              description: linkRequest,
              url: link,
            });
          }

          yield* linkStorage.addLinks(links);

          yield* updateQueueItem({
            ...queueItem,
            status: "completed",
            completedAt: Date.now(),
          });
          break;
        default:
          queueItem.action satisfies never;
          yield* Console.log("Unknown queue item type");
          break;
      }
      yield* Console.log("Queue item processed");
    }
  }).pipe(
    Effect.ensuring(
      deleteQueueLockfile().pipe(
        // Fail silently
        Effect.catchAll(() => Effect.succeed(undefined))
      )
    )
  );
};
