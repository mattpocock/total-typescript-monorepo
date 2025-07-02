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
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { NodeFileSystem } from "@effect/platform-node";

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
            id: "video-1",
            createdAt: Date.now(),
            action: {
              type: "create-auto-edited-video",
              inputVideo: "/test/input.mp4" as AbsolutePath,
              videoName: "test",
              subtitles: false,
              dryRun: false,
            },
            status: "completed",
          },
        ],
      };

      const result = await validateLinksDependency({
        linksDependencyId: "video-1",
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
        linksDependencyId: "links-1",
        queueState,
        codeContent: "const example = 'TypeScript';",
        codePath: "/test/code.ts",
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
        linksDependencyId: "links-1",
        queueState: queueStateNoCode,
        codeContent: "",
        codePath: "",
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
        linksDependencyId: "links-1",
        queueState,
        codeContent: "",
        codePath: "",
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
        linksDependencyId: "nonexistent",
        queueState,
        codeContent: "",
        codePath: "",
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

    it("should create meta folder with article, transcript, and code when alongside is true", async () => {
      const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));
      
      try {
        // Set up temporary files
        const transcriptPath = path.join(tmpdir, "transcript.txt");
        const codePath = path.join(tmpdir, "code.ts");
        const videoDirectory = path.join(tmpdir, "videos");
        
        writeFileSync(transcriptPath, "This is a sample transcript about TypeScript.");
        writeFileSync(codePath, "const example = 'test code';");

        const result = await generateArticleFromTranscriptQueue({
          transcriptPath: transcriptPath as AbsolutePath,
          originalVideoPath: "/test/video.mp4" as AbsolutePath,
          linksDependencyId: "links-1",
          queueState,
          videoName: "my-awesome-video",
          dryRun: true,
          alongside: true,
          codeContent: "const example = 'test code';",
          codePath: codePath,
        }).pipe(
          Effect.provideService(AIService, mockAIService),
          Effect.provideService(ArticleStorageService, mockArticleStorageService),
          Effect.provideService(LinksStorageService, mockLinksStorageService),
          Effect.provide(NodeFileSystem.layer),
          Effect.withConfigProvider(
            ConfigProvider.fromJson({
              EXPORT_DIRECTORY: videoDirectory,
              SHORTS_EXPORT_DIRECTORY: videoDirectory,
              ARTICLES_TO_TAKE: "5",
              PADDED_NUMBER_LENGTH: "3",
            })
          ),
          Effect.runPromise
        );

        expect(result).toEqual({
          title: "Generated Title",
          filename: "my-awesome-video.md",
        });

        // Verify meta folder was created with correct name
        const metaFolderPath = path.join(videoDirectory, "my-awesome-video_meta");
        expect(existsSync(metaFolderPath)).toBe(true);

        // Verify article exists in meta folder
        const articlePath = path.join(metaFolderPath, "my-awesome-video.md");
        expect(existsSync(articlePath)).toBe(true);
        
        const articleContent = readFileSync(articlePath, "utf-8");
        expect(articleContent).toContain("Generated article content");
        expect(articleContent).toContain('title: "Generated Title"');
        expect(articleContent).toContain('originalVideoPath: "/test/video.mp4"');

        // Verify transcript was copied to meta folder
        const metaTranscriptPath = path.join(metaFolderPath, "transcript.txt");
        expect(existsSync(metaTranscriptPath)).toBe(true);
        
        const transcriptContent = readFileSync(metaTranscriptPath, "utf-8");
        expect(transcriptContent).toBe("This is a sample transcript about TypeScript.");

        // Verify code was copied to meta folder with same name as original
        const metaCodePath = path.join(metaFolderPath, "code.ts");
        expect(existsSync(metaCodePath)).toBe(true);
        
        const codeContent = readFileSync(metaCodePath, "utf-8");
        expect(codeContent).toBe("const example = 'test code';");

        // Verify only expected files are in meta folder
        const metaFiles = readdirSync(metaFolderPath);
        expect(metaFiles.sort()).toEqual(["code.ts", "my-awesome-video.md", "transcript.txt"]);

      } finally {
        rmSync(tmpdir, { recursive: true });
      }
    });

    it("should create meta folder without code when code is not provided", async () => {
      const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));
      
      try {
        // Set up temporary files (no code file)
        const transcriptPath = path.join(tmpdir, "transcript.txt");
        const videoDirectory = path.join(tmpdir, "videos");
        
        writeFileSync(transcriptPath, "This is a sample transcript without code.");

        const result = await generateArticleFromTranscriptQueue({
          transcriptPath: transcriptPath as AbsolutePath,
          originalVideoPath: "/test/video.mp4" as AbsolutePath,
          linksDependencyId: "links-1",
          queueState,
          videoName: "video-without-code",
          dryRun: true,
          alongside: true,
          codeContent: "", // No code provided
          codePath: "",   // No code path provided
        }).pipe(
          Effect.provideService(AIService, mockAIService),
          Effect.provideService(ArticleStorageService, mockArticleStorageService),
          Effect.provideService(LinksStorageService, mockLinksStorageService),
          Effect.provide(NodeFileSystem.layer),
          Effect.withConfigProvider(
            ConfigProvider.fromJson({
              EXPORT_DIRECTORY: videoDirectory,
              SHORTS_EXPORT_DIRECTORY: videoDirectory,
              ARTICLES_TO_TAKE: "5",
              PADDED_NUMBER_LENGTH: "3",
            })
          ),
          Effect.runPromise
        );

        expect(result).toEqual({
          title: "Generated Title",
          filename: "video-without-code.md",
        });

        // Verify meta folder was created
        const metaFolderPath = path.join(videoDirectory, "video-without-code_meta");
        expect(existsSync(metaFolderPath)).toBe(true);

        // Verify article exists in meta folder
        const articlePath = path.join(metaFolderPath, "video-without-code.md");
        expect(existsSync(articlePath)).toBe(true);

        // Verify transcript was copied to meta folder
        const metaTranscriptPath = path.join(metaFolderPath, "transcript.txt");
        expect(existsSync(metaTranscriptPath)).toBe(true);
        
        const transcriptContent = readFileSync(metaTranscriptPath, "utf-8");
        expect(transcriptContent).toBe("This is a sample transcript without code.");

        // Verify NO code file was added to meta folder
        const metaFiles = readdirSync(metaFolderPath);
        const codeFiles = metaFiles.filter(file => file.endsWith('.ts') || file.endsWith('.js'));
        expect(codeFiles).toHaveLength(0);

        // Should only contain article and transcript
        expect(metaFiles.sort()).toEqual(["transcript.txt", "video-without-code.md"]);

      } finally {
        rmSync(tmpdir, { recursive: true });
      }
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
        linksDependencyId: "links-1",
        queueState,
        videoName: "test-video",
        dryRun: true,
        alongside: false,
        codeContent: "const example = 'test';",
        codePath: "/test/code.ts",
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
        videoName: string;
        dryRun: boolean;
        alongside: boolean;
        codeContent: string;
        codePath: string;
      };
    } = {
      id: "article-1",
      createdAt: Date.now(),
      action: {
        type: "generate-article-from-transcript",
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        linksDependencyId: "links-1",
        videoName: "test-video",
        dryRun: true,
        alongside: false,
        codeContent: "const example = 'test';",
        codePath: "/test/code.ts",
      },
      status: "ready-to-run",
    };

    const queueState: QueueState = {
      queue: [
        queueItem,
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
