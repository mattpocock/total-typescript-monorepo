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
    }
  | {
      type: "analyze-transcript-for-links";
      transcriptPath: AbsolutePath;
      originalVideoPath: AbsolutePath;
    }
  | {
      type: "code-request";
      transcriptPath: AbsolutePath;
      originalVideoPath: AbsolutePath;
      /**
       * Temporary data storage for code request workflow
       */
      temporaryData?: {
        codePath?: string;
        codeContent?: string;
      };
    }
  | {
      type: "generate-article-from-transcript";
      transcriptPath: AbsolutePath;
      originalVideoPath: AbsolutePath;
      linksDependencyId: string;
      codeDependencyId: string;
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
  status: "ready-to-run" | "completed" | "failed" | "requires-user-input";
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

export const getNextQueueItem = (queueState: QueueState) => {
  const queueItemsAsMap = new Map(queueState.queue.map((i) => [i.id, i]));
  return queueState.queue.find((i) => {
    // Skip items that require user input - they should only be processed by processInformationRequests()
    if (i.status === "requires-user-input") {
      return false;
    }

    const canBeRun = i.status === "ready-to-run";

    const dependenciesAreMet =
      !i.dependencies ||
      i.dependencies.every(
        (dependency) => queueItemsAsMap.get(dependency)?.status === "completed"
      );

    return canBeRun && dependenciesAreMet;
  });
};

export const getOutstandingInformationRequests = () => {
  return Effect.gen(function* () {
    const queueState = yield* getQueueState();
    
    const informationRequests = queueState.queue.filter(
      (item) => (item.action.type === "links-request" || item.action.type === "code-request") && 
               item.status === "requires-user-input"
    );
    
    return informationRequests;
  });
};

export const processInformationRequests = () => {
  return Effect.gen(function* () {
    if (yield* doesQueueLockfileExist()) {
      return yield* Console.log("Queue is locked, skipping");
    }

    const informationRequests = yield* getOutstandingInformationRequests();
    
    if (informationRequests.length === 0) {
      return yield* Console.log("No outstanding information requests found");
    }

    yield* Console.log(`Found ${informationRequests.length} outstanding information request(s)`);
    yield* writeQueueLockfile();

    const askQuestion = yield* AskQuestionService;
    const linkStorage = yield* LinksStorageService;
    const fs = yield* FileSystem;

    for (const queueItem of informationRequests) {
      if (queueItem.action.type === "links-request") {
        yield* Console.log(`Processing information request: ${queueItem.id}`);
        
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
        
        yield* Console.log(`Information request ${queueItem.id} completed`);
      } else if (queueItem.action.type === "code-request") {
        yield* Console.log(`Processing code request: ${queueItem.id}`);
        
        const codePath = yield* askQuestion.askQuestion(
          `Code file path (optional, leave empty if no code needed): `
        );

        let codeContent = "";
        let actualCodePath = "";
        
        if (codePath.trim()) {
          actualCodePath = codePath.trim();
          const codeExists = yield* fs.exists(actualCodePath).pipe(
            Effect.catchAll(() => Effect.succeed(false))
          );
          
          if (codeExists) {
            codeContent = yield* fs.readFileString(actualCodePath).pipe(
              Effect.catchAll((error) => {
                return Effect.gen(function* () {
                  yield* Console.log(`Warning: Could not read code file ${actualCodePath}: ${error}`);
                  return "";
                });
              })
            );
          } else {
            yield* Console.log(`Warning: Code file ${actualCodePath} does not exist`);
          }
        }

        yield* updateQueueItem({
          ...queueItem,
          status: "completed",
          completedAt: Date.now(),
          action: {
            ...queueItem.action,
            temporaryData: {
              codePath: actualCodePath,
              codeContent,
            },
          },
        });
        
        yield* Console.log(`Code request ${queueItem.id} completed`);
      }
    }
    
    yield* Console.log("All information requests processed");
  }).pipe(
    Effect.ensuring(
      deleteQueueLockfile().pipe(
        // Fail silently
        Effect.catchAll(() => Effect.succeed(undefined))
      )
    )
  );
};

export const processQueue = () => {
  return Effect.gen(function* () {
    if (yield* doesQueueLockfileExist()) {
      return yield* Console.log("Queue is locked, skipping");
    }

    yield* writeQueueLockfile();

    const workflows = yield* WorkflowsService;

    while (true) {
      const queueState = yield* getQueueState();
      const queueItem = getNextQueueItem(queueState);

      if (!queueItem) {
        return yield* Console.log("No ready-to-run queue items found");
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
          // This should never happen since getNextQueueItem filters out requires-user-input items
          yield* Console.log("ERROR: Links request found in processQueue - this should not happen");
          continue;
        case "analyze-transcript-for-links":
          yield* Console.log(`Processing analyze-transcript-for-links for ${queueItem.action.transcriptPath}`);
          // TODO: Implement transcript analysis logic
          yield* updateQueueItem({
            ...queueItem,
            status: "completed",
            completedAt: Date.now(),
          });
          break;
        case "code-request":
          // This should be handled by processInformationRequests
          yield* Console.log("ERROR: Code request found in processQueue - this should not happen");
          continue;
        case "generate-article-from-transcript":
          yield* Console.log(`Processing generate-article-from-transcript for ${queueItem.action.transcriptPath}`);
          // TODO: Implement article generation logic
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
