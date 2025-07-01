import { FileSystem } from "@effect/platform/FileSystem";
import { NodeFileSystem } from "@effect/platform-node";
import type { AbsolutePath } from "@total-typescript/shared";
import { Config, ConfigProvider, Effect, Layer } from "effect";
import * as fs from "node:fs/promises";
import path from "node:path";
import { expect, it, vi } from "vitest";
import { getQueueState, processQueue, writeToQueue } from "./queue.js";
import { WorkflowsService } from "../workflows.js";
import { AskQuestionService, LinksStorageService } from "../services.js";

it("Should create the queue.json if it does not exist", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");

          const createAutoEditedVideoWorkflow = vi.fn().mockReturnValue(Effect.succeed(undefined));
      const concatenateVideosWorkflow = vi.fn().mockReturnValue(Effect.succeed(undefined));

    await processQueue().pipe(
      Effect.provide(NodeFileSystem.layer),
      Effect.provideService(
        WorkflowsService,
        new WorkflowsService({
          createAutoEditedVideoWorkflow,
          concatenateVideosWorkflow,
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
    const concatenateVideosWorkflow = vi.fn().mockReturnValue(Effect.succeed(undefined));

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
          status: "ready-to-run",
        },
      ]);
    }).pipe(
      Effect.provide(NodeFileSystem.layer),
      Effect.provideService(
        WorkflowsService,
        new WorkflowsService({
          createAutoEditedVideoWorkflow,
          concatenateVideosWorkflow,
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
        status: "ready-to-run",
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
    const concatenateVideosWorkflow = vi.fn().mockReturnValue(Effect.succeed(undefined));

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
          concatenateVideosWorkflow,
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
    const concatenateVideosWorkflow = vi.fn().mockReturnValue(Effect.succeed(undefined));

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

      // processQueue should ignore information requests 
      yield* processQueue();
    }).pipe(
      Effect.provide(NodeFileSystem.layer),
      Effect.provideService(
        WorkflowsService,
        new WorkflowsService({
          createAutoEditedVideoWorkflow,
          concatenateVideosWorkflow,
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
          status: "ready-to-run",
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
    const concatenateVideosWorkflow = vi.fn().mockReturnValue(Effect.succeed(undefined));

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
          status: "ready-to-run",
        },
      ]);

      yield* processInformationRequests();
    }).pipe(
      Effect.provide(NodeFileSystem.layer),
      Effect.provideService(
        WorkflowsService,
        new WorkflowsService({
          createAutoEditedVideoWorkflow,
          concatenateVideosWorkflow,
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

    // The video creation job should remain ready-to-run (not processed)
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
      status: "ready-to-run",
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

it("Should handle code-request action type and store code content in temporaryData", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");
    const CODE_FILE_PATH = path.join(tmpDir, "test.ts");

    // Create a test code file
    await fs.writeFile(CODE_FILE_PATH, "console.log('hello world');");

    const createAutoEditedVideoWorkflow = vi
      .fn()
      .mockReturnValue(Effect.succeed(undefined));

    const addLinks = vi.fn().mockReturnValue(Effect.succeed(undefined));
    const getLinks = vi.fn().mockReturnValue(Effect.succeed([]));
    const askQuestion = vi.fn().mockReturnValue(Effect.succeed(CODE_FILE_PATH));

    const { processInformationRequests } = await import("./queue.js");

    await Effect.gen(function* () {
      yield* writeToQueue([
        {
          id: "code-1",
          createdAt: Date.now(),
          action: {
            type: "code-request",
            transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
            originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
          },
          status: "requires-user-input",
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

    expect(queueState.queue[0]).toEqual({
      id: "code-1",
      createdAt: expect.any(Number),
      completedAt: expect.any(Number),
      action: {
        type: "code-request",
        transcriptPath: "/path/to/transcript.txt",
        originalVideoPath: "/path/to/video.mp4",
        temporaryData: {
          codePath: CODE_FILE_PATH,
          codeContent: "console.log('hello world');",
        },
      },
      status: "completed",
    });

    expect(askQuestion).toHaveBeenCalledWith(
      "Code file path (optional, leave empty if no code needed): "
    );
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

it("Should handle empty code file path gracefully", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");

    const createAutoEditedVideoWorkflow = vi
      .fn()
      .mockReturnValue(Effect.succeed(undefined));

    const addLinks = vi.fn().mockReturnValue(Effect.succeed(undefined));
    const getLinks = vi.fn().mockReturnValue(Effect.succeed([]));
    const askQuestion = vi.fn().mockReturnValue(Effect.succeed("  ")); // Empty/whitespace

    const { processInformationRequests } = await import("./queue.js");

    await Effect.gen(function* () {
      yield* writeToQueue([
        {
          id: "code-1",
          createdAt: Date.now(),
          action: {
            type: "code-request",
            transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
            originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
          },
          status: "requires-user-input",
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

    expect(queueState.queue[0]).toEqual({
      id: "code-1",
      createdAt: expect.any(Number),
      completedAt: expect.any(Number),
      action: {
        type: "code-request",
        transcriptPath: "/path/to/transcript.txt",
        originalVideoPath: "/path/to/video.mp4",
        temporaryData: {
          codePath: "",
          codeContent: "",
        },
      },
      status: "completed",
    });
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

it("Should handle missing code file gracefully", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");
    const MISSING_FILE_PATH = path.join(tmpDir, "missing.ts");

    const createAutoEditedVideoWorkflow = vi
      .fn()
      .mockReturnValue(Effect.succeed(undefined));

    const addLinks = vi.fn().mockReturnValue(Effect.succeed(undefined));
    const getLinks = vi.fn().mockReturnValue(Effect.succeed([]));
    const askQuestion = vi.fn().mockReturnValue(Effect.succeed(MISSING_FILE_PATH));

    const { processInformationRequests } = await import("./queue.js");

    await Effect.gen(function* () {
      yield* writeToQueue([
        {
          id: "code-1",
          createdAt: Date.now(),
          action: {
            type: "code-request",
            transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
            originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
          },
          status: "requires-user-input",
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

    expect(queueState.queue[0]).toEqual({
      id: "code-1",
      createdAt: expect.any(Number),
      completedAt: expect.any(Number),
      action: {
        type: "code-request",
        transcriptPath: "/path/to/transcript.txt",
        originalVideoPath: "/path/to/video.mp4",
        temporaryData: {
          codePath: MISSING_FILE_PATH,
          codeContent: "",
        },
      },
      status: "completed",
    });
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

it("Should include code-request in outstanding information requests", async () => {
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
            linkRequests: ["test"],
          },
          status: "requires-user-input",
        },
        {
          id: "2",
          createdAt: Date.now(),
          action: {
            type: "code-request",
            transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
            originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
          },
          status: "requires-user-input",
        },
        {
          id: "3",
          createdAt: Date.now(),
          action: {
            type: "create-auto-edited-video",
            inputVideo: "/Users/josh/Desktop/video.mp4" as AbsolutePath,
            videoName: "test",
            subtitles: false,
            dryRun: false,
          },
          status: "ready-to-run",
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

    expect(informationRequests).toHaveLength(2);
    expect(informationRequests.map(r => r.action.type)).toEqual(["links-request", "code-request"]);
    expect(informationRequests.map(r => r.id)).toEqual(["1", "2"]);
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

it("Should handle dependency chains with new action types", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");

    const { getNextQueueItem } = await import("./queue.js");

    const queueState = await Effect.gen(function* () {
      yield* writeToQueue([
        {
          id: "video-1",
          createdAt: Date.now(),
          action: {
            type: "create-auto-edited-video",
            inputVideo: "/Users/josh/Desktop/video.mp4" as AbsolutePath,
            videoName: "test",
            subtitles: false,
            dryRun: false,
          },
          status: "completed",
          completedAt: Date.now(),
        },
        {
          id: "analysis-1",
          createdAt: Date.now(),
          action: {
            type: "analyze-transcript-for-links",
            transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
            originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
          },
          status: "ready-to-run",
          dependencies: ["video-1"],
        },
        {
          id: "code-1",
          createdAt: Date.now(),
          action: {
            type: "code-request",
            transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
            originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
          },
          status: "requires-user-input",
          dependencies: ["analysis-1"],
        },
        {
          id: "article-1",
          createdAt: Date.now(),
          action: {
            type: "generate-article-from-transcript",
            transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
            originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
            linksDependencyId: "links-1",
            codeDependencyId: "code-1",
          },
          status: "ready-to-run",
          dependencies: ["code-1", "links-1"],
        },
      ]);

              return yield* getQueueState();
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

    // Should be able to run analysis-1 since video-1 is completed
    const nextItem = getNextQueueItem(queueState);
    expect(nextItem?.id).toBe("analysis-1");
    expect(nextItem?.action.type).toBe("analyze-transcript-for-links");

    // Should not be able to run code-1 (requires user input) or article-1 (dependencies not met)
    expect(queueState.queue.find(i => i.id === "code-1")?.status).toBe("requires-user-input");
    expect(queueState.queue.find(i => i.id === "article-1")?.status).toBe("ready-to-run");
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

it("Should not process code-request or generate-article-from-transcript in processQueue", async () => {
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
          id: "analysis-1",
          createdAt: Date.now(),
          action: {
            type: "analyze-transcript-for-links",
            transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
            originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
          },
          status: "ready-to-run",
        },
        {
          id: "article-1",
          createdAt: Date.now(),
          action: {
            type: "generate-article-from-transcript",
            transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
            originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
            linksDependencyId: "links-1",
            codeDependencyId: "code-1",
          },
          status: "ready-to-run",
        },
      ]);

      yield* processQueue();
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

    const queueState = JSON.parse(
      (await fs.readFile(QUEUE_LOCATION, "utf-8")).toString()
    );

    // Both items should be processed and completed with TODO implementations
    expect(queueState.queue[0]).toEqual({
      id: "analysis-1",
      createdAt: expect.any(Number),
      completedAt: expect.any(Number),
      action: {
        type: "analyze-transcript-for-links",
        transcriptPath: "/path/to/transcript.txt",
        originalVideoPath: "/path/to/video.mp4",
      },
      status: "completed",
    });

    expect(queueState.queue[1]).toEqual({
      id: "article-1",
      createdAt: expect.any(Number),
      completedAt: expect.any(Number),
      action: {
        type: "generate-article-from-transcript",
        transcriptPath: "/path/to/transcript.txt",
        originalVideoPath: "/path/to/video.mp4",
        linksDependencyId: "links-1",
        codeDependencyId: "code-1",
      },
      status: "completed",
    });
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});
