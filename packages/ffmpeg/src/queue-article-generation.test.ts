import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import { type AbsolutePath } from "@total-typescript/shared";
import { ConfigProvider, Effect } from "effect";
import { beforeEach, describe, expect, it } from "vitest";
import {
  ArticleGenerationError,
  CodeDependencyNotFoundError,
  generateArticleFromTranscriptQueue,
  getCodeFromQueueItem,
  LinksDependencyNotFoundError,
  processArticleGenerationForQueue,
  TranscriptReadError,
  validateLinksDependency,
} from "./queue-article-generation.js";
import type { QueueItem, QueueState } from "./queue/queue.js";
import { AIService, ArticleStorageService, LinksStorageService } from "./services.js";

const testConfig = ConfigProvider.fromMap(
  new Map([
    ["LINKS_STORAGE_PATH", "/tmp/test-links.json"],
    ["ARTICLE_STORAGE_PATH", "/tmp/test-articles"],
    ["ARTICLES_TO_TAKE", "3"],
    ["PADDED_NUMBER_LENGTH", "3"],
  ])
);

const mockAIService = AIService.of({
  askForLinks: Effect.succeed([]),
  articleFromTranscript: Effect.succeed("Generated article content"),
  titleFromTranscript: Effect.succeed("Generated Title"),
});

const mockArticleStorageService = ArticleStorageService.of({
  storeArticle: Effect.succeed(undefined),
  countArticles: Effect.succeed(5),
  getLatestArticles: Effect.succeed([
    {
      content: "Previous article content",
      originalVideoPath: "/test/video.mp4" as AbsolutePath,
      date: new Date(),
      title: "Previous Article",
      filename: "001-previous-article.md",
    },
  ]),
});

const mockLinksStorageService = LinksStorageService.of({
  getLinks: Effect.succeed([
    { description: "TypeScript docs", url: "https://typescriptlang.org" },
    { description: "React docs", url: "https://react.dev" },
  ]),
  addLinks: Effect.succeed(undefined),
});

const createMockFS = (files: Record<string, string> = {}) => {
  return FileSystem.of({
    readFileString: (path: string) => {
      const content = files[path];
      if (content === undefined) {
        return Effect.fail(new Error(`File not found: ${path}`));
      }
      return Effect.succeed(content);
    },
    writeFileString: () => Effect.succeed(undefined),
    exists: (path: string) => Effect.succeed(files[path] !== undefined),
    stat: () => Effect.fail(new Error("Not implemented")),
    readDirectory: () => Effect.fail(new Error("Not implemented")),
    remove: () => Effect.fail(new Error("Not implemented")),
    rename: () => Effect.fail(new Error("Not implemented")),
    mkdir: () => Effect.fail(new Error("Not implemented")),
  });
};

describe("queue-article-generation", () => {
  describe("getCodeFromQueueItem", () => {
    it("should retrieve code content from completed code-request queue item", async () => {
      const queueState: QueueState = {
        queue: [
          {
            id: "code-1",
            createdAt: Date.now(),
            action: {
              type: "code-request",
              transcriptPath: "/test/transcript.txt" as AbsolutePath,
              originalVideoPath: "/test/video.mp4" as AbsolutePath,
              temporaryData: {
                codePath: "/test/code.ts",
                codeContent: "const hello = 'world';",
              },
            },
            status: "completed",
            completedAt: Date.now(),
          },
        ],
      };

      const result = await getCodeFromQueueItem({
        queueItemId: "code-1",
        queueState,
      }).pipe(Effect.runPromise);

      expect(result).toBe("const hello = 'world';");
    });

    it("should return undefined when no code content is available", async () => {
      const queueState: QueueState = {
        queue: [
          {
            id: "code-1",
            createdAt: Date.now(),
            action: {
              type: "code-request",
              transcriptPath: "/test/transcript.txt" as AbsolutePath,
              originalVideoPath: "/test/video.mp4" as AbsolutePath,
              temporaryData: {
                codePath: "",
                codeContent: "",
              },
            },
            status: "completed",
            completedAt: Date.now(),
          },
        ],
      };

      const result = await getCodeFromQueueItem({
        queueItemId: "code-1",
        queueState,
      }).pipe(Effect.runPromise);

      expect(result).toBe("");
    });

    it("should fail when queue item is not found", async () => {
      const queueState: QueueState = { queue: [] };

      const result = await getCodeFromQueueItem({
        queueItemId: "nonexistent",
        queueState,
      }).pipe(Effect.either, Effect.runPromise);

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(CodeDependencyNotFoundError);
      }
    });

    it("should fail when queue item is not a code-request", async () => {
      const queueState: QueueState = {
        queue: [
          {
            id: "video-1",
            createdAt: Date.now(),
            action: {
              type: "create-auto-edited-video",
              inputVideo: "/test/input.mp4" as AbsolutePath,
              videoName: "test",
              subtitles: true,
              dryRun: false,
            },
            status: "completed",
          },
        ],
      };

      const result = await getCodeFromQueueItem({
        queueItemId: "video-1",
        queueState,
      }).pipe(Effect.either, Effect.runPromise);

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(CodeDependencyNotFoundError);
      }
    });

    it("should fail when queue item is not completed", async () => {
      const queueState: QueueState = {
        queue: [
          {
            id: "code-1",
            createdAt: Date.now(),
            action: {
              type: "code-request",
              transcriptPath: "/test/transcript.txt" as AbsolutePath,
              originalVideoPath: "/test/video.mp4" as AbsolutePath,
            },
            status: "ready-to-run",
          },
        ],
      };

      const result = await getCodeFromQueueItem({
        queueItemId: "code-1",
        queueState,
      }).pipe(Effect.either, Effect.runPromise);

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(CodeDependencyNotFoundError);
      }
    });
  });

  describe("validateLinksDependency", () => {
    it("should succeed when links-request queue item is completed", async () => {
      const queueState: QueueState = {
        queue: [
          {
            id: "links-1",
            createdAt: Date.now(),
            action: {
              type: "links-request",
              linkRequests: ["TypeScript docs", "React docs"],
            },
            status: "completed",
            completedAt: Date.now(),
          },
        ],
      };

      const result = await validateLinksDependency({
        linksDependencyId: "links-1",
        queueState,
      }).pipe(Effect.runPromise);

      expect(result).toBeUndefined();
    });

    it("should fail when queue item is not found", async () => {
      const queueState: QueueState = { queue: [] };

      const result = await validateLinksDependency({
        linksDependencyId: "nonexistent",
        queueState,
      }).pipe(Effect.either, Effect.runPromise);

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(LinksDependencyNotFoundError);
      }
    });

    it("should fail when queue item is not a links-request", async () => {
      const queueState: QueueState = {
        queue: [
          {
            id: "code-1",
            createdAt: Date.now(),
            action: {
              type: "code-request",
              transcriptPath: "/test/transcript.txt" as AbsolutePath,
              originalVideoPath: "/test/video.mp4" as AbsolutePath,
            },
            status: "completed",
          },
        ],
      };

      const result = await validateLinksDependency({
        linksDependencyId: "code-1",
        queueState,
      }).pipe(Effect.either, Effect.runPromise);

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(LinksDependencyNotFoundError);
      }
    });

    it("should fail when queue item is not completed", async () => {
      const queueState: QueueState = {
        queue: [
          {
            id: "links-1",
            createdAt: Date.now(),
            action: {
              type: "links-request",
              linkRequests: [],
            },
            status: "ready-to-run",
          },
        ],
      };

      const result = await validateLinksDependency({
        linksDependencyId: "links-1",
        queueState,
      }).pipe(Effect.either, Effect.runPromise);

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(LinksDependencyNotFoundError);
      }
    });
  });

  describe("generateArticleFromTranscriptQueue", () => {
    const mockFS = createMockFS({
      "/test/transcript.txt": "This is a sample transcript about TypeScript.",
    });

    const queueState: QueueState = {
      queue: [
        {
          id: "code-1",
          createdAt: Date.now(),
          action: {
            type: "code-request",
            transcriptPath: "/test/transcript.txt" as AbsolutePath,
            originalVideoPath: "/test/video.mp4" as AbsolutePath,
            temporaryData: {
              codePath: "/test/code.ts",
              codeContent: "const example = 'TypeScript';",
            },
          },
          status: "completed",
          completedAt: Date.now(),
        },
        {
          id: "links-1",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["TypeScript docs"],
          },
          status: "completed",
          completedAt: Date.now(),
        },
      ],
    };

    it("should generate article successfully with code and links", async () => {
      const result = await generateArticleFromTranscriptQueue({
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        codeDependencyId: "code-1",
        linksDependencyId: "links-1",
        queueState,
      }).pipe(
        Effect.provide(mockFS),
        Effect.provide(mockAIService),
        Effect.provide(mockArticleStorageService),
        Effect.provide(mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.runPromise
      );

      expect(result).toEqual({
        title: "Generated Title",
        filename: "006-generated-title.md",
      });
    });

    it("should generate article successfully without code", async () => {
      const queueStateNoCode: QueueState = {
        queue: [
          {
            id: "code-1",
            createdAt: Date.now(),
            action: {
              type: "code-request",
              transcriptPath: "/test/transcript.txt" as AbsolutePath,
              originalVideoPath: "/test/video.mp4" as AbsolutePath,
              temporaryData: {
                codePath: "",
                codeContent: "",
              },
            },
            status: "completed",
            completedAt: Date.now(),
          },
          {
            id: "links-1",
            createdAt: Date.now(),
            action: {
              type: "links-request",
              linkRequests: [],
            },
            status: "completed",
            completedAt: Date.now(),
          },
        ],
      };

      const result = await generateArticleFromTranscriptQueue({
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        codeDependencyId: "code-1",
        linksDependencyId: "links-1",
        queueState: queueStateNoCode,
      }).pipe(
        Effect.provide(mockFS),
        Effect.provide(mockAIService),
        Effect.provide(mockArticleStorageService),
        Effect.provide(mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.runPromise
      );

      expect(result).toEqual({
        title: "Generated Title",
        filename: "006-generated-title.md",
      });
    });

    it("should fail when transcript file is not found", async () => {
      const emptyFS = createMockFS({});

      const result = await generateArticleFromTranscriptQueue({
        transcriptPath: "/nonexistent/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        codeDependencyId: "code-1",
        linksDependencyId: "links-1",
        queueState,
      }).pipe(
        Effect.provide(emptyFS),
        Effect.provide(mockAIService),
        Effect.provide(mockArticleStorageService),
        Effect.provide(mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(TranscriptReadError);
      }
    });

    it("should fail when transcript is empty", async () => {
      const emptyTranscriptFS = createMockFS({
        "/test/transcript.txt": "   \n\t  ",
      });

      const result = await generateArticleFromTranscriptQueue({
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        codeDependencyId: "code-1",
        linksDependencyId: "links-1",
        queueState,
      }).pipe(
        Effect.provide(emptyTranscriptFS),
        Effect.provide(mockAIService),
        Effect.provide(mockArticleStorageService),
        Effect.provide(mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(ArticleGenerationError);
      }
    });

    it("should fail when code dependency is invalid", async () => {
      const result = await generateArticleFromTranscriptQueue({
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        codeDependencyId: "nonexistent",
        linksDependencyId: "links-1",
        queueState,
      }).pipe(
        Effect.provide(mockFS),
        Effect.provide(mockAIService),
        Effect.provide(mockArticleStorageService),
        Effect.provide(mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(CodeDependencyNotFoundError);
      }
    });

    it("should fail when links dependency is invalid", async () => {
      const result = await generateArticleFromTranscriptQueue({
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        codeDependencyId: "code-1",
        linksDependencyId: "nonexistent",
        queueState,
      }).pipe(
        Effect.provide(mockFS),
        Effect.provide(mockAIService),
        Effect.provide(mockArticleStorageService),
        Effect.provide(mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(LinksDependencyNotFoundError);
      }
    });
  });

  describe("processArticleGenerationForQueue", () => {
    const mockUpdateQueueItem = Effect.succeed(undefined);

    const queueItem: QueueItem & {
      action: {
        type: "generate-article-from-transcript";
        transcriptPath: AbsolutePath;
        originalVideoPath: AbsolutePath;
        linksDependencyId: string;
        codeDependencyId: string;
      };
    } = {
      id: "article-1",
      createdAt: Date.now(),
      action: {
        type: "generate-article-from-transcript",
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        linksDependencyId: "links-1",
        codeDependencyId: "code-1",
      },
      status: "ready-to-run",
    };

    const queueState: QueueState = {
      queue: [
        queueItem,
        {
          id: "code-1",
          createdAt: Date.now(),
          action: {
            type: "code-request",
            transcriptPath: "/test/transcript.txt" as AbsolutePath,
            originalVideoPath: "/test/video.mp4" as AbsolutePath,
            temporaryData: {
              codePath: "/test/code.ts",
              codeContent: "const example = 'test';",
            },
          },
          status: "completed",
          completedAt: Date.now(),
        },
        {
          id: "links-1",
          createdAt: Date.now(),
          action: {
            type: "links-request",
            linkRequests: ["Test link"],
          },
          status: "completed",
          completedAt: Date.now(),
        },
      ],
    };

    it("should process article generation successfully", async () => {
      const mockFS = createMockFS({
        "/test/transcript.txt": "Sample transcript content for testing.",
      });

      const result = await processArticleGenerationForQueue({
        queueItem,
        queueState,
        updateQueueItem: () => mockUpdateQueueItem,
      }).pipe(
        Effect.provide(mockFS),
        Effect.provide(mockAIService),
        Effect.provide(mockArticleStorageService),
        Effect.provide(mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.runPromise
      );

      expect(result).toEqual({
        title: "Generated Title",
        filename: "006-generated-title.md",
      });
    });
  });
});