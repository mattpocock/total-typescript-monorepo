import { FileSystem } from "@effect/platform";
import { type AbsolutePath } from "@total-typescript/shared";
import { ConfigProvider, Effect } from "effect";
import { describe, expect, it } from "vitest";
import {
  ArticleGenerationError,
  generateArticleFromTranscriptQueue,
  LinksDependencyNotFoundError,
  processArticleGenerationForQueue,
  validateLinksDependency,
} from "./queue-article-generation.js";
import type { QueueItem, QueueState } from "./queue/queue.js";
import {
  AIService,
  ArticleStorageService,
  LinksStorageService,
} from "./services.js";

const testConfig = ConfigProvider.fromMap(
  new Map([
    ["LINKS_STORAGE_PATH", "/tmp/test-links.json"],
    ["ARTICLE_STORAGE_PATH", "/tmp/test-articles"],
    ["EXPORT_DIRECTORY", "/path/to/export"],
    ["SHORTS_EXPORT_DIRECTORY", "/path/to/shorts"],
    ["ARTICLES_TO_TAKE", "3"],
    ["PADDED_NUMBER_LENGTH", "3"],
  ])
);

const mockAIService = new AIService({
  askForLinks: () => Effect.succeed([]),
  articleFromTranscript: () => Effect.succeed("Generated article content"),
  titleFromTranscript: () => Effect.succeed("Generated Title"),
});

const mockArticleStorageService = new ArticleStorageService({
  storeArticle: () => Effect.succeed(undefined),
  countArticles: () => Effect.succeed(5),
  getLatestArticles: () =>
    Effect.succeed([
      {
        content: "Previous article content",
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        date: new Date(),
        title: "Previous Article",
        filename: "001-previous-article.md",
      },
    ]),
});

const mockLinksStorageService = new LinksStorageService({
  getLinks: () =>
    Effect.succeed([
      { description: "TypeScript docs", url: "https://typescriptlang.org" },
      { description: "React docs", url: "https://react.dev" },
    ]),
  addLinks: () => Effect.succeed(undefined),
});

const createMockFS = (files: Record<string, string> = {}) => {
  return FileSystem.makeNoop({
    readFileString: (path: string) => {
      const content = files[path];
      if (content === undefined) {
        throw new Error(`File not found: ${path}`);
      }
      return Effect.succeed(content);
    },
    writeFileString: () => Effect.succeed(undefined),
    exists: (path: string) => Effect.succeed(files[path] !== undefined),
  });
};

describe("queue-article-generation", () => {
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
        Effect.provideService(FileSystem.FileSystem, mockFS),
        Effect.provideService(AIService, mockAIService),
        Effect.provideService(ArticleStorageService, mockArticleStorageService),
        Effect.provideService(LinksStorageService, mockLinksStorageService),
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
        Effect.provideService(FileSystem.FileSystem, mockFS),
        Effect.provideService(AIService, mockAIService),
        Effect.provideService(ArticleStorageService, mockArticleStorageService),
        Effect.provideService(LinksStorageService, mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.runPromise
      );

      expect(result).toEqual({
        title: "Generated Title",
        filename: "006-generated-title.md",
      });
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
        Effect.provideService(FileSystem.FileSystem, emptyTranscriptFS),
        Effect.provideService(AIService, mockAIService),
        Effect.provideService(ArticleStorageService, mockArticleStorageService),
        Effect.provideService(LinksStorageService, mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(ArticleGenerationError);
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
        Effect.provideService(FileSystem.FileSystem, mockFS),
        Effect.provideService(AIService, mockAIService),
        Effect.provideService(ArticleStorageService, mockArticleStorageService),
        Effect.provideService(LinksStorageService, mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(LinksDependencyNotFoundError);
      }
    });

    it("should save article alongside video in export directory when alongside is true and dryRun is true", async () => {
      let capturedPath: string | undefined;
      let capturedContent: string | undefined;

      const mockFSWithCapture = FileSystem.makeNoop({
        readFileString: (path: string) => {
          const files = {
            "/test/transcript.txt":
              "This is a sample transcript about TypeScript.",
          };
          const content = files[path as keyof typeof files];
          if (content === undefined) {
            throw new Error(`File not found: ${path}`);
          }
          return Effect.succeed(content);
        },
        writeFileString: (path: string, content: string) => {
          capturedPath = path;
          capturedContent = content;
          return Effect.succeed(undefined);
        },
        exists: () => Effect.succeed(true),
      });

      const result = await generateArticleFromTranscriptQueue({
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        codeDependencyId: "code-1",
        linksDependencyId: "links-1",
        queueState,
        videoName: "my-awesome-video",
        dryRun: true,
        alongside: true,
      }).pipe(
        Effect.provideService(FileSystem.FileSystem, mockFSWithCapture),
        Effect.provideService(AIService, mockAIService),
        Effect.provideService(ArticleStorageService, mockArticleStorageService),
        Effect.provideService(LinksStorageService, mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.runPromise
      );

      expect(result).toEqual({
        title: "Generated Title",
        filename: "my-awesome-video.md",
      });

      // Verify the article was saved to the export directory with the video name
      expect(capturedPath).toBe("/path/to/export/my-awesome-video.md");
      expect(capturedContent).toContain("Generated article content");
      expect(capturedContent).toContain('title: "Generated Title"');
      expect(capturedContent).toContain('originalVideoPath: "/test/video.mp4"');
    });

    it("should save article alongside video in shorts directory when alongside is true and dryRun is false", async () => {
      let capturedPath: string | undefined;
      let capturedContent: string | undefined;

      const mockFSWithCapture = FileSystem.makeNoop({
        readFileString: (path: string) => {
          const files = {
            "/test/transcript.txt":
              "This is a sample transcript about TypeScript.",
          };
          const content = files[path as keyof typeof files];
          if (content === undefined) {
            throw new Error(`File not found: ${path}`);
          }
          return Effect.succeed(content);
        },
        writeFileString: (path: string, content: string) => {
          capturedPath = path;
          capturedContent = content;
          return Effect.succeed(undefined);
        },
        exists: () => Effect.succeed(true),
      });

      const result = await generateArticleFromTranscriptQueue({
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        codeDependencyId: "code-1",
        linksDependencyId: "links-1",
        queueState,
        videoName: "uploaded-video",
        dryRun: false,
        alongside: true,
      }).pipe(
        Effect.provideService(FileSystem.FileSystem, mockFSWithCapture),
        Effect.provideService(AIService, mockAIService),
        Effect.provideService(ArticleStorageService, mockArticleStorageService),
        Effect.provideService(LinksStorageService, mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.runPromise
      );

      expect(result).toEqual({
        title: "Generated Title",
        filename: "uploaded-video.md",
      });

      // Verify the article was saved to the shorts directory with the video name
      expect(capturedPath).toBe("/path/to/shorts/uploaded-video.md");
      expect(capturedContent).toContain("Generated article content");
      expect(capturedContent).toContain('title: "Generated Title"');
      expect(capturedContent).toContain('originalVideoPath: "/test/video.mp4"');
    });

    it("should use regular article storage when alongside is false", async () => {
      let mockStoreArticleCalled = false;
      let capturedArticle: any;

      const mockArticleStorageServiceWithCapture = new ArticleStorageService({
        storeArticle: (article) => {
          mockStoreArticleCalled = true;
          capturedArticle = article;
          return Effect.succeed(undefined);
        },
        countArticles: () => Effect.succeed(5),
        getLatestArticles: () => Effect.succeed([]),
      });

      const result = await generateArticleFromTranscriptQueue({
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        codeDependencyId: "code-1",
        linksDependencyId: "links-1",
        queueState,
        videoName: "test-video",
        dryRun: true,
        alongside: false,
      }).pipe(
        Effect.provideService(FileSystem.FileSystem, mockFS),
        Effect.provideService(AIService, mockAIService),
        Effect.provideService(
          ArticleStorageService,
          mockArticleStorageServiceWithCapture
        ),
        Effect.provideService(LinksStorageService, mockLinksStorageService),
        Effect.withConfigProvider(testConfig),
        Effect.runPromise
      );

      expect(result).toEqual({
        title: "Generated Title",
        filename: "006-generated-title.md",
      });

      // Verify that regular article storage was used
      expect(mockStoreArticleCalled).toBe(true);
      expect(capturedArticle.filename).toBe("006-generated-title.md");
      expect(capturedArticle.title).toBe("Generated Title");
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
        videoName: string;
        dryRun: boolean;
        alongside: boolean;
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
        videoName: "test-video",
        dryRun: true,
        alongside: false,
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
      }).pipe(
        Effect.provideService(FileSystem.FileSystem, mockFS),
        Effect.provideService(AIService, mockAIService),
        Effect.provideService(ArticleStorageService, mockArticleStorageService),
        Effect.provideService(LinksStorageService, mockLinksStorageService),
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
