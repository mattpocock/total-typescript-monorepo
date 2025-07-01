import { FileSystem } from "@effect/platform/FileSystem";
import { NodeFileSystem } from "@effect/platform-node";
import type { AbsolutePath } from "@total-typescript/shared";
import { Config, ConfigProvider, Effect, Layer } from "effect";
import * as fs from "node:fs/promises";
import path from "node:path";
import { expect, it, vi } from "vitest";
import { getQueueState, processQueue, writeToQueue } from "./queue.js";
import { WorkflowsService } from "../workflows.js";
import {
  AIService,
  ArticleStorageService,
  AskQuestionService,
  LinksStorageService,
} from "../services.js";

it("Should create the queue.json if it does not exist", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");

    const createAutoEditedVideoWorkflow = vi
      .fn()
      .mockReturnValue(Effect.succeed(undefined));
    const concatenateVideosWorkflow = vi
      .fn()
      .mockReturnValue(Effect.succeed(undefined));

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
        AIService,
        new AIService({
          articleFromTranscript: vi
            .fn()
            .mockReturnValue(Effect.succeed("test")),
          titleFromTranscript: vi.fn().mockReturnValue(Effect.succeed("test")),
          askForLinks: vi.fn().mockReturnValue(Effect.succeed(["test"])),
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
      Effect.provideService(
        ArticleStorageService,
        new ArticleStorageService({
          countArticles: vi.fn().mockReturnValue(Effect.succeed(0)),
          getLatestArticles: vi.fn().mockReturnValue(Effect.succeed([])),
          storeArticle: vi.fn().mockReturnValue(Effect.succeed(undefined)),
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
    const concatenateVideosWorkflow = vi
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
    const concatenateVideosWorkflow = vi
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
    const concatenateVideosWorkflow = vi
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
      Effect.provideService(
        AIService,
        new AIService({
          articleFromTranscript: vi
            .fn()
            .mockReturnValue(Effect.succeed("test")),
          titleFromTranscript: vi.fn().mockReturnValue(Effect.succeed("test")),
          askForLinks: vi.fn().mockReturnValue(Effect.succeed(["test"])),
        })
      ),
      Effect.provideService(
        ArticleStorageService,
        new ArticleStorageService({
          countArticles: vi.fn().mockReturnValue(Effect.succeed(0)),
          getLatestArticles: vi.fn().mockReturnValue(Effect.succeed([])),
          storeArticle: vi.fn().mockReturnValue(Effect.succeed(undefined)),
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

it("Should not return information requests with unmet dependencies", async () => {
  const tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "queue"));

  try {
    const QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    const QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");

    const { getOutstandingInformationRequests } = await import("./queue.js");

    const informationRequests = await Effect.gen(function* () {
      yield* writeToQueue([
        {
          id: "dependency-1",
          createdAt: Date.now(),
          action: {
            type: "create-auto-edited-video",
            inputVideo: "/Users/josh/Desktop/video.mp4" as AbsolutePath,
            videoName: "test",
            subtitles: false,
            dryRun: false,
          },
          status: "ready-to-run", // Not completed - dependency not met
        },
        {
          id: "dependency-2",
          createdAt: Date.now(),
          action: {
            type: "analyze-transcript-for-links",
            transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
            originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
          },
          status: "completed", // Completed - dependency met
          completedAt: Date.now(),
        },
        {
          id: "links-request-1",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["test"],
          },
          status: "requires-user-input",
          dependencies: ["dependency-1"], // Depends on incomplete item
        },

        {
          id: "links-request-2",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["another test"],
          },
          status: "requires-user-input",
          // No dependencies - should be included
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

    // Should only return information requests with met dependencies or no dependencies
    expect(informationRequests).toHaveLength(1);

    // Should include links-request-2 (no dependencies)
    const linksRequest2 = informationRequests.find(
      (r) => r.id === "links-request-2"
    );
    expect(linksRequest2).toBeDefined();
    expect(linksRequest2!.action.type).toBe("links-request");

    // Should NOT include links-request-1 (dependency not met)
    const linksRequest1 = informationRequests.find(
      (r) => r.id === "links-request-1"
    );
    expect(linksRequest1).toBeUndefined();
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
    const concatenateVideosWorkflow = vi
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
          id: "links-1",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["test link"],
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
            codePath: "/test/code.ts",
            codeContent: "const example = 'test';",
          },
          status: "ready-to-run",
          dependencies: ["links-1"],
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

    // Should not be able to run links-1 (requires user input) or article-1 (dependencies not met)
    expect(queueState.queue.find((i) => i.id === "links-1")?.status).toBe(
      "requires-user-input"
    );
    expect(queueState.queue.find((i) => i.id === "article-1")?.status).toBe(
      "ready-to-run"
    );
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});
