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
import type { QueueItem } from "./queue/queue.js";
import type { QueueState } from "./queue/queue-updater-service.js";
import {
  AIService,
  ArticleStorageService,
  LinksStorageService,
} from "./services.js";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
} from "node:fs";
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

    it("should save article, transcript, and code alongside video when alongside is true", async () => {
      const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));

      try {
        // Set up temporary files
        const transcriptPath = path.join(tmpdir, "transcript.txt");
        const codePath = path.join(tmpdir, "code.ts");
        const videoDirectory = path.join(tmpdir, "videos");

        writeFileSync(
          transcriptPath,
          "This is a sample transcript about TypeScript."
        );
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
          Effect.provideService(
            ArticleStorageService,
            mockArticleStorageService
          ),
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
          filename: "my-awesome-video.article.md",
        });

        // Verify article exists alongside video
        const articlePath = path.join(
          videoDirectory,
          "my-awesome-video.article.md"
        );
        expect(existsSync(articlePath)).toBe(true);

        const articleContent = readFileSync(articlePath, "utf-8");
        expect(articleContent).toContain("Generated article content");
        expect(articleContent).toContain('title: "Generated Title"');
        expect(articleContent).toContain(
          'originalVideoPath: "/test/video.mp4"'
        );

        // Verify transcript was copied alongside video
        const transcriptAlongsidePath = path.join(
          videoDirectory,
          "my-awesome-video.transcript.txt"
        );
        expect(existsSync(transcriptAlongsidePath)).toBe(true);

        const transcriptContent = readFileSync(
          transcriptAlongsidePath,
          "utf-8"
        );
        expect(transcriptContent).toBe(
          "This is a sample transcript about TypeScript."
        );

        // Verify code was saved alongside video with proper naming
        const codeAlongsidePath = path.join(
          videoDirectory,
          "my-awesome-video.code.ts"
        );
        expect(existsSync(codeAlongsidePath)).toBe(true);

        const codeContent = readFileSync(codeAlongsidePath, "utf-8");
        expect(codeContent).toBe("const example = 'test code';");

        // Verify expected files are in video directory
        const videoDirectoryFiles = readdirSync(videoDirectory);
        const expectedFiles = [
          "my-awesome-video.article.md",
          "my-awesome-video.transcript.txt",
          "my-awesome-video.code.ts",
        ];
        expectedFiles.forEach((file) => {
          expect(videoDirectoryFiles).toContain(file);
        });
      } finally {
        rmSync(tmpdir, { recursive: true });
      }
    });

    it("should save article and transcript alongside video without code when code is not provided", async () => {
      const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));

      try {
        // Set up temporary files (no code file)
        const transcriptPath = path.join(tmpdir, "transcript.txt");
        const videoDirectory = path.join(tmpdir, "videos");

        writeFileSync(
          transcriptPath,
          "This is a sample transcript without code."
        );

        const result = await generateArticleFromTranscriptQueue({
          transcriptPath: transcriptPath as AbsolutePath,
          originalVideoPath: "/test/video.mp4" as AbsolutePath,
          linksDependencyId: "links-1",
          queueState,
          videoName: "video-without-code",
          dryRun: true,
          alongside: true,
          codeContent: "", // No code provided
          codePath: "", // No code path provided
        }).pipe(
          Effect.provideService(AIService, mockAIService),
          Effect.provideService(
            ArticleStorageService,
            mockArticleStorageService
          ),
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
          filename: "video-without-code.article.md",
        });

        // Verify article exists alongside video
        const articlePath = path.join(
          videoDirectory,
          "video-without-code.article.md"
        );
        expect(existsSync(articlePath)).toBe(true);

        // Verify transcript was copied alongside video
        const transcriptAlongsidePath = path.join(
          videoDirectory,
          "video-without-code.transcript.txt"
        );
        expect(existsSync(transcriptAlongsidePath)).toBe(true);

        const transcriptContent = readFileSync(
          transcriptAlongsidePath,
          "utf-8"
        );
        expect(transcriptContent).toBe(
          "This is a sample transcript without code."
        );

        // Verify NO code file was created alongside video
        const videoDirectoryFiles = readdirSync(videoDirectory);
        const codeFiles = videoDirectoryFiles.filter((file) =>
          file.includes(".code.")
        );
        expect(codeFiles).toHaveLength(0);

        // Should contain article and transcript
        const expectedFiles = [
          "video-without-code.article.md",
          "video-without-code.transcript.txt",
        ];
        expectedFiles.forEach((file) => {
          expect(videoDirectoryFiles).toContain(file);
        });
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
