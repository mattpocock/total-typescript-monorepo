import { NodeFileSystem } from "@effect/platform-node";
import type { AbsolutePath } from "@total-typescript/shared";
import { ConfigProvider, Effect, Layer } from "effect";
import * as fs from "node:fs/promises";
import path from "node:path";
import { expect, it, vi } from "vitest";
import { processQueue, writeToQueue } from "./queue.js";
import { WorkflowsService } from "../workflows.js";
import { AskQuestionService, LinksStorageService } from "../services.js";

it("Should create the queue.json if it does not exist", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");

    const createAutoEditedVideoWorkflow = vi.fn();

    await processQueue({ hasUserInput: false }).pipe(
      Effect.provide(NodeFileSystem.layer),
      Effect.provideService(
        WorkflowsService,
        new WorkflowsService({
          createAutoEditedVideoWorkflow,
        })
      ),
      Effect.provideService(
        LinksStorageService,
        new LinksStorageService({
          addLinks: vi.fn(),
          getLinks: vi.fn().mockReturnValue(Effect.succeed([])),
        })
      ),
      Effect.provideService(
        AskQuestionService,
        new AskQuestionService({
          askQuestion: vi.fn().mockReturnValue(Effect.succeed("test")),
          select: vi.fn().mockReturnValue(Effect.succeed("test")),
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

it("Should allow you to add a link request to the queue and process it with processInformationRequests", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");

    const createAutoEditedVideoWorkflow = vi
      .fn()
      .mockReturnValue(Effect.succeed(undefined));

    const addLinks = vi.fn().mockReturnValue(Effect.succeed(undefined));
    const getLinks = vi.fn().mockReturnValue(Effect.succeed([]));

    const { processInformationRequests } = await import("./queue.js");

    await Effect.gen(function* () {
      yield* writeToQueue([
        {
          id: "1",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["test", "test2"],
          },
          status: "requires-user-input",
        },
      ]);

      // Use processInformationRequests instead of processQueue
      yield* processInformationRequests();
    }).pipe(
      Effect.provide(NodeFileSystem.layer),
      Effect.provideService(
        WorkflowsService,
        new WorkflowsService({
          createAutoEditedVideoWorkflow,
        })
      ),
      Effect.provideService(
        LinksStorageService,
        new LinksStorageService({
          addLinks,
          getLinks,
        })
      ),
      Effect.provideService(
        AskQuestionService,
        new AskQuestionService({
          askQuestion: vi.fn().mockReturnValue(Effect.succeed("awesome-url")),
          select: vi.fn().mockReturnValue(Effect.succeed("test")),
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
          type: "links-request",
          linkRequests: ["test", "test2"],
        },
        status: "completed",
        completedAt: expect.any(Number),
      },
    ]);

    expect(addLinks).toHaveBeenCalledWith([
      { description: "test", url: "awesome-url" },
      { description: "test2", url: "awesome-url" },
    ]);
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

it("Should not process links requests (processQueue ignores information requests)", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");

    const createAutoEditedVideoWorkflow = vi
      .fn()
      .mockReturnValue(Effect.succeed(undefined));

    const addLinks = vi.fn().mockReturnValue(Effect.succeed(undefined));
    const getLinks = vi.fn().mockReturnValue(Effect.succeed([]));
    const askQuestion = vi.fn().mockReturnValue(Effect.succeed("awesome-url"));

    await Effect.gen(function* () {
      yield* writeToQueue([
        {
          id: "1",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["test", "test2"],
          },
          status: "requires-user-input",
        },
      ]);

      // processQueue should ignore information requests regardless of hasUserInput
      yield* processQueue({ hasUserInput: true });
    }).pipe(
      Effect.provide(NodeFileSystem.layer),
      Effect.provideService(
        WorkflowsService,
        new WorkflowsService({
          createAutoEditedVideoWorkflow,
        })
      ),
      Effect.provideService(
        LinksStorageService,
        new LinksStorageService({
          addLinks,
          getLinks,
        })
      ),
      Effect.provideService(
        AskQuestionService,
        new AskQuestionService({
          askQuestion,
          select: vi.fn().mockReturnValue(Effect.succeed("test")),
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

    // The queue item should remain unchanged - not processed by processQueue
    expect(queueState.queue).toEqual([
      {
        id: "1",
        createdAt: expect.any(Number),
        action: {
          type: "links-request",
          linkRequests: ["test", "test2"],
        },
        status: "requires-user-input",
      },
    ]);

    // These functions should not have been called by processQueue
    expect(addLinks).not.toHaveBeenCalled();
    expect(askQuestion).not.toHaveBeenCalled();
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

it("Should return outstanding information requests", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");

    const { getOutstandingInformationRequests } = await import("./queue.js");

    const informationRequests = await Effect.gen(function* () {
      yield* writeToQueue([
        {
          id: "1",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["test", "test2"],
          },
          status: "requires-user-input",
        },
        {
          id: "2",
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
        {
          id: "3",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["another test"],
          },
          status: "completed",
        },
      ]);

      return yield* getOutstandingInformationRequests();
    }).pipe(
      Effect.provide(NodeFileSystem.layer),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          QUEUE_LOCATION,
          QUEUE_LOCKFILE_LOCATION,
        })
      ),
      Effect.runPromise
    );

    expect(informationRequests).toHaveLength(1);
    expect(informationRequests[0]!.id).toBe("1");
    expect(informationRequests[0]!.action.type).toBe("links-request");
    expect(informationRequests[0]!.status).toBe("requires-user-input");
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

it("Should process only information requests", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");

    const createAutoEditedVideoWorkflow = vi
      .fn()
      .mockReturnValue(Effect.succeed(undefined));

    const addLinks = vi.fn().mockReturnValue(Effect.succeed(undefined));
    const getLinks = vi.fn().mockReturnValue(Effect.succeed([]));
    const askQuestion = vi.fn().mockReturnValue(Effect.succeed("awesome-url"));

    const { processInformationRequests } = await import("./queue.js");

    await Effect.gen(function* () {
      yield* writeToQueue([
        {
          id: "1",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["test", "test2"],
          },
          status: "requires-user-input",
        },
        {
          id: "2",
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

      yield* processInformationRequests();
    }).pipe(
      Effect.provide(NodeFileSystem.layer),
      Effect.provideService(
        WorkflowsService,
        new WorkflowsService({
          createAutoEditedVideoWorkflow,
        })
      ),
      Effect.provideService(
        LinksStorageService,
        new LinksStorageService({
          addLinks,
          getLinks,
        })
      ),
      Effect.provideService(
        AskQuestionService,
        new AskQuestionService({
          askQuestion,
          select: vi.fn().mockReturnValue(Effect.succeed("test")),
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

    // The information request should be completed
    expect(queueState.queue[0]).toEqual({
      id: "1",
      createdAt: expect.any(Number),
      completedAt: expect.any(Number),
      action: {
        type: "links-request",
        linkRequests: ["test", "test2"],
      },
      status: "completed",
    });

    // The video creation job should remain idle (not processed)
    expect(queueState.queue[1]).toEqual({
      id: "2",
      createdAt: expect.any(Number),
      action: {
        type: "create-auto-edited-video",
        inputVideo: "/Users/josh/Desktop/video.mp4",
        videoName: "test",
        subtitles: false,
        dryRun: false,
      },
      status: "idle",
    });

    // Links should have been added
    expect(addLinks).toHaveBeenCalledWith([
      { description: "test", url: "awesome-url" },
      { description: "test2", url: "awesome-url" },
    ]);

    // createAutoEditedVideoWorkflow should NOT have been called
    expect(createAutoEditedVideoWorkflow).not.toHaveBeenCalled();
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});
