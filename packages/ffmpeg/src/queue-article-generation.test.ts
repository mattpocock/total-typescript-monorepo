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
      let capturedOperations: Array<{ operation: string; path: string; content?: string }> = [];

      const mockFSWithCapture = FileSystem.makeNoop({
        readFileString: (path: string) => {
          const files = {
            "/test/transcript.txt": "This is a sample transcript about TypeScript.",
          };
          const content = files[path as keyof typeof files];
          if (content === undefined) {
            throw new Error(`File not found: ${path}`);
          }
          return Effect.succeed(content);
        },
        writeFileString: (path: string, content: string) => {
          capturedOperations.push({ operation: "writeFile", path, content });
          return Effect.succeed(undefined);
        },
        makeDirectory: (path: string) => {
          capturedOperations.push({ operation: "makeDirectory", path });
          return Effect.succeed(undefined);
        },
        copyFile: (source: string, dest: string) => {
          capturedOperations.push({ operation: "copyFile", path: `${source} -> ${dest}` });
          return Effect.succeed(undefined);
        },
        exists: () => Effect.succeed(true),
      });

      const result = await generateArticleFromTranscriptQueue({
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        linksDependencyId: "links-1",
        queueState,
        videoName: "my-awesome-video",
        dryRun: true,
        alongside: true,
        codeContent: "const example = 'test code';",
        codePath: "/test/code.ts",
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

      // Verify meta folder was created with correct name
      const makeDirOperation = capturedOperations.find(op => 
        op.operation === "makeDirectory" && op.path.endsWith("my-awesome-video_meta")
      );
      expect(makeDirOperation).toBeDefined();
      expect(makeDirOperation?.path).toBe("/path/to/export/my-awesome-video_meta");

      // Verify article was written to meta folder
      const articleOperation = capturedOperations.find(op => 
        op.operation === "writeFile" && op.path.endsWith("my-awesome-video_meta/my-awesome-video.md")
      );
      expect(articleOperation).toBeDefined();
      expect(articleOperation?.content).toContain("Generated article content");
      expect(articleOperation?.content).toContain('title: "Generated Title"');

      // Verify transcript was copied to meta folder
      const transcriptOperation = capturedOperations.find(op => 
        op.operation === "copyFile" && op.path.includes("transcript.txt")
      );
      expect(transcriptOperation).toBeDefined();
      expect(transcriptOperation?.path).toBe("/test/transcript.txt -> /path/to/export/my-awesome-video_meta/transcript.txt");

      // Verify code was written to meta folder with same name as original
      const codeOperation = capturedOperations.find(op => 
        op.operation === "writeFile" && op.path.endsWith("my-awesome-video_meta/code.ts")
      );
      expect(codeOperation).toBeDefined();
      expect(codeOperation?.content).toBe("const example = 'test code';");
    });

    it("should create meta folder without code when code is not provided", async () => {
      let capturedOperations: Array<{ operation: string; path: string; content?: string }> = [];

      const mockFSWithCapture = FileSystem.makeNoop({
        readFileString: (path: string) => {
          const files = {
            "/test/transcript.txt": "This is a sample transcript without code.",
          };
          const content = files[path as keyof typeof files];
          if (content === undefined) {
            throw new Error(`File not found: ${path}`);
          }
          return Effect.succeed(content);
        },
        writeFileString: (path: string, content: string) => {
          capturedOperations.push({ operation: "writeFile", path, content });
          return Effect.succeed(undefined);
        },
        makeDirectory: (path: string) => {
          capturedOperations.push({ operation: "makeDirectory", path });
          return Effect.succeed(undefined);
        },
        copyFile: (source: string, dest: string) => {
          capturedOperations.push({ operation: "copyFile", path: `${source} -> ${dest}` });
          return Effect.succeed(undefined);
        },
        exists: () => Effect.succeed(true),
      });

      const result = await generateArticleFromTranscriptQueue({
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        linksDependencyId: "links-1",
        queueState,
        videoName: "video-without-code",
        dryRun: true,
        alongside: true,
        codeContent: "", // No code provided
        codePath: "",   // No code path provided
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
        filename: "video-without-code.md",
      });

      // Verify meta folder was created
      const makeDirOperation = capturedOperations.find(op => 
        op.operation === "makeDirectory" && op.path.endsWith("video-without-code_meta")
      );
      expect(makeDirOperation).toBeDefined();

      // Verify article was written to meta folder
      const articleOperation = capturedOperations.find(op => 
        op.operation === "writeFile" && op.path.endsWith("video-without-code_meta/video-without-code.md")
      );
      expect(articleOperation).toBeDefined();

      // Verify transcript was copied to meta folder
      const transcriptOperation = capturedOperations.find(op => 
        op.operation === "copyFile" && op.path.includes("transcript.txt")
      );
      expect(transcriptOperation).toBeDefined();

      // Verify NO code file was added to meta folder (should not have writeFile operation for code file)
      const codeOperations = capturedOperations.filter(op => 
        op.operation === "writeFile" && (op.path.endsWith('.ts') || op.path.endsWith('.js')) && !op.path.endsWith('.md')
      );
      expect(codeOperations).toHaveLength(0);

      // Should have exactly 3 operations: makeDirectory, writeFile (article), copyFile (transcript)
      expect(capturedOperations).toHaveLength(3);
    });

    it("should save article alongside video in shorts directory when alongside is true and dryRun is false", async () => {
      let capturedOperations: Array<{ operation: string; path: string; content?: string }> = [];

      const mockFSWithCapture = FileSystem.makeNoop({
        readFileString: (path: string) => {
          const files = {
            "/test/transcript.txt": "This is a transcript for shorts upload.",
          };
          const content = files[path as keyof typeof files];
          if (content === undefined) {
            throw new Error(`File not found: ${path}`);
          }
          return Effect.succeed(content);
        },
        writeFileString: (path: string, content: string) => {
          capturedOperations.push({ operation: "writeFile", path, content });
          return Effect.succeed(undefined);
        },
        makeDirectory: (path: string) => {
          capturedOperations.push({ operation: "makeDirectory", path });
          return Effect.succeed(undefined);
        },
        copyFile: (source: string, dest: string) => {
          capturedOperations.push({ operation: "copyFile", path: `${source} -> ${dest}` });
          return Effect.succeed(undefined);
        },
        exists: () => Effect.succeed(true),
      });

      const result = await generateArticleFromTranscriptQueue({
        transcriptPath: "/test/transcript.txt" as AbsolutePath,
        originalVideoPath: "/test/video.mp4" as AbsolutePath,
        linksDependencyId: "links-1",
        queueState,
        videoName: "uploaded-video",
        dryRun: false, // This means it will go to shorts directory
        alongside: true,
        codeContent: "const uploadExample = 'shorts';",
        codePath: "/test/example.ts",
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

      // Verify meta folder was created in shorts directory (not export directory)
      const makeDirOperation = capturedOperations.find(op => 
        op.operation === "makeDirectory" && op.path.endsWith("uploaded-video_meta")
      );
      expect(makeDirOperation).toBeDefined();
      expect(makeDirOperation?.path).toBe("/path/to/shorts/uploaded-video_meta");

      // Verify article was written to meta folder
      const articleOperation = capturedOperations.find(op => 
        op.operation === "writeFile" && op.path.endsWith("uploaded-video_meta/uploaded-video.md")
      );
      expect(articleOperation).toBeDefined();

      // Verify transcript was copied to meta folder
      const transcriptOperation = capturedOperations.find(op => 
        op.operation === "copyFile" && op.path.includes("transcript.txt")
      );
      expect(transcriptOperation).toBeDefined();
      expect(transcriptOperation?.path).toBe("/test/transcript.txt -> /path/to/shorts/uploaded-video_meta/transcript.txt");

      // Verify code was written to meta folder with same name as original
      const codeOperation = capturedOperations.find(op => 
        op.operation === "writeFile" && op.path.endsWith("uploaded-video_meta/example.ts")
      );
      expect(codeOperation).toBeDefined();
      expect(codeOperation?.content).toBe("const uploadExample = 'shorts';");

      // Should have exactly 4 operations: makeDirectory, writeFile (article), copyFile (transcript), writeFile (code)
      expect(capturedOperations).toHaveLength(4);
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
