// @ts-nocheck

import type { AbsolutePath } from "@total-typescript/shared";
import { Effect } from "effect";
import { expect, it, vi } from "vitest";
import { generateArticleCore } from "./article-from-transcript.js";
import { AIService, ArticleStorageService } from "./services.js";
import { FileSystem } from "@effect/platform";

it("Should save article alongside video when storageMode is alongside-video", async () => {
  let capturedPaths: string[] = [];
  let capturedContent: string | undefined;

  const mockFS = FileSystem.makeNoop({
    writeFileString: (path: string, content: string) => {
      capturedPaths.push(path);
      if (path.endsWith(".md")) {
        capturedContent = content;
      }
      return Effect.succeed(undefined);
    },
    makeDirectory: (path: string) => {
      capturedPaths.push(`mkdir:${path}`);
      return Effect.succeed(undefined);
    },
    copyFile: (source: string, dest: string) => {
      capturedPaths.push(`copy:${source}->${dest}`);
      return Effect.succeed(undefined);
    },
  });

  const articleFromTranscript = vi
    .fn()
    .mockReturnValue(Effect.succeed("test article content"));

  const articleStorageService = {
    storeArticle: vi.fn().mockReturnValue(Effect.succeed(void 0)),
    getLatestArticles: vi.fn().mockReturnValue(Effect.succeed([])),
    countArticles: vi.fn().mockReturnValue(Effect.succeed(0)),
  };

  const result = await generateArticleCore({
    originalVideoPath: "test/fixtures/video.mp4" as AbsolutePath,
    transcript: "Awesome video about TypeScript",
    urls: [],
    code: "const example = 'TypeScript code';",
    storageMode: "alongside-video",
    videoDirectory: "/path/to/videos",
    videoName: "awesome-typescript-video",
    transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
    codePath: "/path/to/code.ts",
  }).pipe(
    Effect.provideService(AIService, {
      articleFromTranscript,
      titleFromTranscript: vi
        .fn()
        .mockReturnValue(Effect.succeed("TypeScript Magic")),
    }),
    Effect.provideService(ArticleStorageService, articleStorageService),
    Effect.provideService(FileSystem.FileSystem, mockFS),
    Effect.runPromise,
  );

  expect(result).toEqual({
    title: "TypeScript Magic",
    filename: "awesome-typescript-video.article.md",
    content: "test article content",
    savedAt: "/path/to/videos/awesome-typescript-video.article.md",
  });

  // Verify the article was written alongside the video
  expect(capturedPaths).toContain(
    "/path/to/videos/awesome-typescript-video.article.md",
  );
  expect(capturedContent).toContain("test article content");
  expect(capturedContent).toContain('title: "TypeScript Magic"');
  expect(capturedContent).toContain(
    'originalVideoPath: "test/fixtures/video.mp4"',
  );

  // Verify the transcript was copied alongside the video
  expect(capturedPaths).toContain(
    "copy:/path/to/transcript.txt->/path/to/videos/awesome-typescript-video.transcript.txt",
  );

  // Verify the code file was written alongside the video
  expect(capturedPaths).toContain(
    "/path/to/videos/awesome-typescript-video.code.ts",
  );

  // Verify that the regular article storage was NOT called
  expect(articleStorageService.storeArticle).not.toHaveBeenCalled();
});
