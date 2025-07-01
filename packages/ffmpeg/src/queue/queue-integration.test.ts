import { FileSystem } from "@effect/platform/FileSystem";
import { NodeFileSystem } from "@effect/platform-node";
import type { AbsolutePath } from "@total-typescript/shared";
import { Config, ConfigProvider, Effect } from "effect";
import * as fs from "node:fs/promises";
import path from "node:path";
import { expect, it, describe, vi, beforeEach, afterEach } from "vitest";
import { getQueueState, processQueue, processInformationRequests, writeToQueue } from "./queue.js";
import { WorkflowsService } from "../workflows.js";
import {
  AIService,
  ArticleStorageService,
  AskQuestionService,
  LinksStorageService,
} from "../services.js";
import { createAutoEditedVideoQueueItems } from "../queue-creation.js";

describe("Article Generation Workflow Integration Tests", () => {
  let tmpDir: string;
  let QUEUE_LOCATION: string;
  let QUEUE_LOCKFILE_LOCATION: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(import.meta.dirname, "integration"));
    QUEUE_LOCATION = path.join(tmpDir, "queue.json");
    QUEUE_LOCKFILE_LOCATION = path.join(tmpDir, "queue.lock");
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  describe("Complete Article Generation Workflow", () => {
    it("Should successfully complete entire workflow with article generation enabled", async () => {
      // Mock transcript file
      const transcriptPath = path.join(tmpDir, "test-video.txt");
      const transcriptContent = "This is a test transcript about TypeScript and React.";
      await fs.writeFile(transcriptPath, transcriptContent);

      // Mock code file
      const codePath = path.join(tmpDir, "example.ts");
      const codeContent = `interface User {\n  name: string;\n  age: number;\n}`;
      await fs.writeFile(codePath, codeContent);

      const createAutoEditedVideoWorkflow = vi
        .fn()
        .mockReturnValue(Effect.succeed("/path/to/output.mp4"));

      const concatenateVideosWorkflow = vi
        .fn()
        .mockReturnValue(Effect.succeed(undefined));

      // Track the sequence of service calls
      const callSequence: string[] = [];

      const mockAIService = {
        askForLinks: vi.fn().mockImplementation(() => {
          callSequence.push("askForLinks");
          return Effect.succeed(["TypeScript documentation", "React handbook"]);
        }),
        articleFromTranscript: vi.fn().mockImplementation(() => {
          callSequence.push("articleFromTranscript");
          return Effect.succeed("# Generated Article\n\nThis is a test article about TypeScript and React.");
        }),
        titleFromTranscript: vi.fn().mockImplementation(() => {
          callSequence.push("titleFromTranscript");
          return Effect.succeed("TypeScript and React Guide");
        }),
      };

      const mockLinksStorageService = {
        addLinks: vi.fn().mockImplementation(() => {
          callSequence.push("addLinks");
          return Effect.succeed(undefined);
        }),
        getLinks: vi.fn().mockReturnValue(Effect.succeed([])),
      };

      const mockAskQuestionService = {
        askQuestion: vi.fn().mockImplementation((question: string) => {
          callSequence.push(`askQuestion: ${question.slice(0, 20)}...`);
          if (question.includes("Code file path")) {
            return Effect.succeed(codePath);
          }
          if (question.includes("TypeScript documentation")) {
            return Effect.succeed("https://typescriptlang.org/docs");
          }
          if (question.includes("React handbook")) {
            return Effect.succeed("https://react.dev/learn");
          }
          return Effect.succeed("test-response");
        }),
        select: vi.fn().mockReturnValue(Effect.succeed("test")),
      };

      const mockArticleStorageService = {
        countArticles: vi.fn().mockReturnValue(Effect.succeed(5)),
        getLatestArticles: vi.fn().mockReturnValue(Effect.succeed([])),
        storeArticle: vi.fn().mockImplementation(() => {
          callSequence.push("storeArticle");
          return Effect.succeed(undefined);
        }),
      };

      await Effect.gen(function* () {
        // Step 1: Create queue items with article generation enabled
        const queueItems = yield* createAutoEditedVideoQueueItems({
          inputVideo: "/test/input.mp4" as AbsolutePath,
          videoName: "test-video",
          subtitles: false,
          dryRun: true,
          generateArticle: true,
        });

        expect(queueItems).toHaveLength(5);
        yield* writeToQueue(queueItems);

        // Step 2: Process the video creation (auto)
        yield* processQueue();
        
        let queueState = yield* getQueueState();
        expect(queueState.queue[0]!.status).toBe("completed"); // video creation
        expect(queueState.queue[1]!.status).toBe("completed"); // transcript analysis
        expect(queueState.queue[2]!.status).toBe("requires-user-input"); // code request
        expect(queueState.queue[3]!.status).toBe("requires-user-input"); // links request
        expect(queueState.queue[4]!.status).toBe("ready-to-run"); // article generation (waiting for deps)

        // Step 3: Process information requests (user input)
        yield* processInformationRequests();

        queueState = yield* getQueueState();
        expect(queueState.queue[2]!.status).toBe("completed"); // code request completed
        expect(queueState.queue[3]!.status).toBe("completed"); // links request completed

        // Verify code content was stored
        const codeRequestItem = queueState.queue[2]!;
        if (codeRequestItem.action.type === "code-request") {
          expect(codeRequestItem.action.temporaryData?.codeContent).toBe(codeContent);
          expect(codeRequestItem.action.temporaryData?.codePath).toBe(codePath);
        }

        // Step 4: Process article generation (auto)
        yield* processQueue();

        queueState = yield* getQueueState();
        expect(queueState.queue[4]!.status).toBe("completed"); // article generation completed

        // Verify the workflow executed in correct order
        expect(callSequence).toEqual([
          "askForLinks",
          "askQuestion: Code file path...",
          "askQuestion: TypeScript document...",
          "askQuestion: React handbook...",
          "addLinks",
          "articleFromTranscript",
          "titleFromTranscript",
          "storeArticle",
        ]);

        // Verify all services were called with expected data
        expect(mockAIService.askForLinks).toHaveBeenCalledWith({
          transcript: transcriptContent,
        });

        expect(mockLinksStorageService.addLinks).toHaveBeenCalledWith([
          { description: "TypeScript documentation", url: "https://typescriptlang.org/docs" },
          { description: "React handbook", url: "https://react.dev/learn" },
        ]);

        expect(mockAIService.articleFromTranscript).toHaveBeenCalledWith({
          transcript: transcriptContent,
          mostRecentArticles: [],
          code: codeContent,
          urls: [
            { request: "TypeScript documentation", url: "https://typescriptlang.org/docs" },
            { request: "React handbook", url: "https://react.dev/learn" },
          ],
        });

        expect(mockArticleStorageService.storeArticle).toHaveBeenCalledWith({
          content: "# Generated Article\n\nThis is a test article about TypeScript and React.",
          originalVideoPath: "/test/obs-output/input.mp4",
          date: expect.any(Date),
          title: "TypeScript and React Guide",
          filename: "006-typescript-and-react-guide.md",
        });
      }).pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.provideService(WorkflowsService, new WorkflowsService({
          createAutoEditedVideoWorkflow,
          concatenateVideosWorkflow,
        })),
        Effect.provideService(AIService, mockAIService),
        Effect.provideService(LinksStorageService, mockLinksStorageService),
        Effect.provideService(AskQuestionService, mockAskQuestionService),
        Effect.provideService(ArticleStorageService, mockArticleStorageService),
        Effect.withConfigProvider(
          ConfigProvider.fromJson({
            QUEUE_LOCATION,
            QUEUE_LOCKFILE_LOCATION,
            TRANSCRIPTION_DIRECTORY: tmpDir,
            OBS_OUTPUT_DIRECTORY: "/test/obs-output",
          })
        ),
        Effect.runPromise
      );
    });

    it("Should handle workflow gracefully when no code is provided", async () => {
      const transcriptPath = path.join(tmpDir, "test-video.txt");
      const transcriptContent = "Simple transcript without code.";
      await fs.writeFile(transcriptPath, transcriptContent);

      const createAutoEditedVideoWorkflow = vi
        .fn()
        .mockReturnValue(Effect.succeed("/path/to/output.mp4"));

      const mockAskQuestionService = {
        askQuestion: vi.fn().mockImplementation((question: string) => {
          if (question.includes("Code file path")) {
            return Effect.succeed(""); // No code provided
          }
          return Effect.succeed("https://example.com");
        }),
        select: vi.fn(),
      };

      const mockAIService = {
        askForLinks: vi.fn().mockReturnValue(Effect.succeed(["Example link"])),
        articleFromTranscript: vi.fn().mockReturnValue(Effect.succeed("Article without code")),
        titleFromTranscript: vi.fn().mockReturnValue(Effect.succeed("Simple Article")),
      };

      await Effect.gen(function* () {
        const queueItems = yield* createAutoEditedVideoQueueItems({
          inputVideo: "/test/input.mp4" as AbsolutePath,
          videoName: "test-video",
          subtitles: false,
          dryRun: true,
          generateArticle: true,
        });

        yield* writeToQueue(queueItems);
        yield* processQueue(); // Process video and transcript analysis
        yield* processInformationRequests(); // Handle code and links requests
        yield* processQueue(); // Process article generation

        const queueState = yield* getQueueState();
        
        // All items should be completed
        queueState.queue.forEach(item => {
          expect(item.status).toBe("completed");
        });

        // Verify article was generated without code
        expect(mockAIService.articleFromTranscript).toHaveBeenCalledWith({
          transcript: transcriptContent,
          mostRecentArticles: [],
          code: "", // Empty code
          urls: [{ request: "Example link", url: "https://example.com" }],
        });
      }).pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.provideService(WorkflowsService, new WorkflowsService({
          createAutoEditedVideoWorkflow,
          concatenateVideosWorkflow: vi.fn(),
        })),
        Effect.provideService(AIService, mockAIService),
        Effect.provideService(LinksStorageService, {
          addLinks: vi.fn().mockReturnValue(Effect.succeed(undefined)),
          getLinks: vi.fn().mockReturnValue(Effect.succeed([])),
        }),
        Effect.provideService(AskQuestionService, mockAskQuestionService),
        Effect.provideService(ArticleStorageService, {
          countArticles: vi.fn().mockReturnValue(Effect.succeed(0)),
          getLatestArticles: vi.fn().mockReturnValue(Effect.succeed([])),
          storeArticle: vi.fn().mockReturnValue(Effect.succeed(undefined)),
        }),
        Effect.withConfigProvider(
          ConfigProvider.fromJson({
            QUEUE_LOCATION,
            QUEUE_LOCKFILE_LOCATION,
            TRANSCRIPTION_DIRECTORY: tmpDir,
            OBS_OUTPUT_DIRECTORY: "/test/obs-output",
          })
        ),
        Effect.runPromise
      );
    });

    it("Should handle transcript analysis failure gracefully", async () => {
      const createAutoEditedVideoWorkflow = vi
        .fn()
        .mockReturnValue(Effect.succeed("/path/to/output.mp4"));

      const mockAIService = {
        askForLinks: vi.fn().mockReturnValue(Effect.fail(new Error("AI service unavailable"))),
        articleFromTranscript: vi.fn(),
        titleFromTranscript: vi.fn(),
      };

      await Effect.gen(function* () {
        const queueItems = yield* createAutoEditedVideoQueueItems({
          inputVideo: "/test/input.mp4" as AbsolutePath,
          videoName: "test-video",
          subtitles: false,
          dryRun: true,
          generateArticle: true,
        });

        yield* writeToQueue(queueItems);
        yield* processQueue(); // This should handle the transcript analysis failure

        const queueState = yield* getQueueState();
        
        // Video creation should succeed
        expect(queueState.queue[0]!.status).toBe("completed");
        
        // Transcript analysis should fail
        expect(queueState.queue[1]!.status).toBe("failed");
        expect(queueState.queue[1]!.error).toContain("AI service unavailable");
        
        // Dependent items should remain waiting since dependency failed
        expect(queueState.queue[2]!.status).toBe("requires-user-input"); // code request
        expect(queueState.queue[3]!.status).toBe("requires-user-input"); // links request (not updated)
        expect(queueState.queue[4]!.status).toBe("ready-to-run"); // article generation
      }).pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.provideService(WorkflowsService, new WorkflowsService({
          createAutoEditedVideoWorkflow,
          concatenateVideosWorkflow: vi.fn(),
        })),
        Effect.provideService(AIService, mockAIService),
        Effect.provideService(LinksStorageService, {
          addLinks: vi.fn(),
          getLinks: vi.fn().mockReturnValue(Effect.succeed([])),
        }),
        Effect.provideService(AskQuestionService, {
          askQuestion: vi.fn(),
          select: vi.fn(),
        }),
        Effect.provideService(ArticleStorageService, {
          countArticles: vi.fn().mockReturnValue(Effect.succeed(0)),
          getLatestArticles: vi.fn().mockReturnValue(Effect.succeed([])),
          storeArticle: vi.fn(),
        }),
        Effect.withConfigProvider(
          ConfigProvider.fromJson({
            QUEUE_LOCATION,
            QUEUE_LOCKFILE_LOCATION,
            TRANSCRIPTION_DIRECTORY: tmpDir,
            OBS_OUTPUT_DIRECTORY: "/test/obs-output",
          })
        ),
        Effect.runPromise
      );
    });

    it("Should handle article generation failure but continue workflow", async () => {
      const transcriptPath = path.join(tmpDir, "test-video.txt");
      await fs.writeFile(transcriptPath, "Test transcript");

      const createAutoEditedVideoWorkflow = vi
        .fn()
        .mockReturnValue(Effect.succeed("/path/to/output.mp4"));

      const mockAIService = {
        askForLinks: vi.fn().mockReturnValue(Effect.succeed([])),
        articleFromTranscript: vi.fn().mockReturnValue(Effect.fail(new Error("Article generation failed"))),
        titleFromTranscript: vi.fn(),
      };

      await Effect.gen(function* () {
        const queueItems = yield* createAutoEditedVideoQueueItems({
          inputVideo: "/test/input.mp4" as AbsolutePath,
          videoName: "test-video",
          subtitles: false,
          dryRun: true,
          generateArticle: true,
        });

        yield* writeToQueue(queueItems);
        yield* processQueue(); // Process video and transcript analysis
        yield* processInformationRequests(); // Handle user inputs
        yield* processQueue(); // Process article generation (should fail)

        const queueState = yield* getQueueState();
        
        // Video, transcript analysis, code request, links request should succeed
        expect(queueState.queue[0]!.status).toBe("completed");
        expect(queueState.queue[1]!.status).toBe("completed");
        expect(queueState.queue[2]!.status).toBe("completed");
        expect(queueState.queue[3]!.status).toBe("completed");
        
        // Article generation should fail
        expect(queueState.queue[4]!.status).toBe("failed");
        expect(queueState.queue[4]!.error).toContain("Article generation failed");
      }).pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.provideService(WorkflowsService, new WorkflowsService({
          createAutoEditedVideoWorkflow,
          concatenateVideosWorkflow: vi.fn(),
        })),
        Effect.provideService(AIService, mockAIService),
        Effect.provideService(LinksStorageService, {
          addLinks: vi.fn().mockReturnValue(Effect.succeed(undefined)),
          getLinks: vi.fn().mockReturnValue(Effect.succeed([])),
        }),
        Effect.provideService(AskQuestionService, {
          askQuestion: vi.fn().mockReturnValue(Effect.succeed("")),
          select: vi.fn(),
        }),
        Effect.provideService(ArticleStorageService, {
          countArticles: vi.fn().mockReturnValue(Effect.succeed(0)),
          getLatestArticles: vi.fn().mockReturnValue(Effect.succeed([])),
          storeArticle: vi.fn(),
        }),
        Effect.withConfigProvider(
          ConfigProvider.fromJson({
            QUEUE_LOCATION,
            QUEUE_LOCKFILE_LOCATION,
            TRANSCRIPTION_DIRECTORY: tmpDir,
            OBS_OUTPUT_DIRECTORY: "/test/obs-output",
          })
        ),
        Effect.runPromise
      );
    });
  });

  describe("Queue Dependency Validation", () => {
    it("Should respect dependency order and not process items before dependencies are complete", async () => {
      await Effect.gen(function* () {
        const queueItems = yield* createAutoEditedVideoQueueItems({
          inputVideo: "/test/input.mp4" as AbsolutePath,
          videoName: "test-video",
          subtitles: false,
          dryRun: true,
          generateArticle: true,
        });

        yield* writeToQueue(queueItems);

        // Initially, only video creation should be ready to run
        const initialState = yield* getQueueState();
        const readyItems = initialState.queue.filter(item => 
          item.status === "ready-to-run" && 
          (!item.dependencies || item.dependencies.length === 0)
        );
        
        expect(readyItems).toHaveLength(1);
        expect(readyItems[0]!.action.type).toBe("create-auto-edited-video");

        // No other items should be processable yet
        const nonReadyItems = initialState.queue.filter(item => 
          item.dependencies && item.dependencies.length > 0
        );
        expect(nonReadyItems).toHaveLength(4);
      }).pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.withConfigProvider(
          ConfigProvider.fromJson({
            QUEUE_LOCATION,
            QUEUE_LOCKFILE_LOCATION,
            TRANSCRIPTION_DIRECTORY: tmpDir,
            OBS_OUTPUT_DIRECTORY: "/test/obs-output",
          })
        ),
        Effect.runPromise
      );
    });

    it("Should validate that article generation has correct dependency IDs", async () => {
      await Effect.gen(function* () {
        const queueItems = yield* createAutoEditedVideoQueueItems({
          inputVideo: "/test/input.mp4" as AbsolutePath,
          videoName: "test-video",
          subtitles: false,
          dryRun: true,
          generateArticle: true,
        });

        const codeRequestId = queueItems[2]!.id;
        const linksRequestId = queueItems[3]!.id;
        const articleGenerationItem = queueItems[4]!;

        // Verify article generation has both code and links dependencies
        expect(articleGenerationItem.dependencies).toContain(codeRequestId);
        expect(articleGenerationItem.dependencies).toContain(linksRequestId);

        if (articleGenerationItem.action.type === "generate-article-from-transcript") {
          expect(articleGenerationItem.action.codeDependencyId).toBe(codeRequestId);
          expect(articleGenerationItem.action.linksDependencyId).toBe(linksRequestId);
        }
      }).pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.withConfigProvider(
          ConfigProvider.fromJson({
            QUEUE_LOCATION,
            QUEUE_LOCKFILE_LOCATION,
            TRANSCRIPTION_DIRECTORY: tmpDir,
            OBS_OUTPUT_DIRECTORY: "/test/obs-output",
          })
        ),
        Effect.runPromise
      );
    });
  });
});