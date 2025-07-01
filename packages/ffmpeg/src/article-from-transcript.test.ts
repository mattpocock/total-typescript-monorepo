// @ts-nocheck

import type { AbsolutePath } from "@total-typescript/shared";
import { Clock, Effect } from "effect";
import { expect, it, vi } from "vitest";
import { generateArticleFromTranscript, generateArticleCore } from "./article-from-transcript.js";
import { AIService, ArticleStorageService } from "./services.js";
import { FileSystem } from "@effect/platform";

it("Should generate an article given a transcript", async () => {
  const articleFromTranscript = vi.fn().mockReturnValue(Effect.succeed("test"));

  const articleStorageService = {
    storeArticle: vi.fn().mockReturnValue(Effect.succeed(void 0)),
    getLatestArticles: vi.fn().mockReturnValue(Effect.succeed([])),
    countArticles: vi.fn().mockReturnValue(Effect.succeed(0)),
  };

  await generateArticleFromTranscript({
    originalVideoPath: "test/fixtures/video.mp4" as AbsolutePath,
    transcript: "Awesome video",
    urls: [],
  }).pipe(
    Effect.provideService(AIService, {
      articleFromTranscript,
      titleFromTranscript: vi
        .fn()
        .mockReturnValue(Effect.succeed("My Wonderful Article")),
    }),
    Effect.provideService(ArticleStorageService, articleStorageService),
    Effect.runPromise
  );

  expect(articleFromTranscript).toHaveBeenCalledWith({
    transcript: "Awesome video",
    mostRecentArticles: [],
    urls: [],
  });

  expect(articleStorageService.storeArticle).toHaveBeenCalledWith({
    content: "test",
    originalVideoPath: "test/fixtures/video.mp4",
    date: expect.any(Date),
    title: "My Wonderful Article",
    filename: "001-my-wonderful-article.md",
  });
});

it("Should save article alongside video when storageMode is alongside-video", async () => {
  let capturedPath: string | undefined;
  let capturedContent: string | undefined;

  const mockFS = FileSystem.makeNoop({
    writeFileString: (path: string, content: string) => {
      capturedPath = path;
      capturedContent = content;
      return Effect.succeed(undefined);
    },
  });

  const articleFromTranscript = vi.fn().mockReturnValue(Effect.succeed("test article content"));

  const articleStorageService = {
    storeArticle: vi.fn().mockReturnValue(Effect.succeed(void 0)),
    getLatestArticles: vi.fn().mockReturnValue(Effect.succeed([])),
    countArticles: vi.fn().mockReturnValue(Effect.succeed(0)),
  };

  const result = await generateArticleCore({
    originalVideoPath: "test/fixtures/video.mp4" as AbsolutePath,
    transcript: "Awesome video about TypeScript",
    urls: [],
    storageMode: "alongside-video",
    videoDirectory: "/path/to/videos",
    videoName: "awesome-typescript-video",
  }).pipe(
    Effect.provideService(AIService, {
      articleFromTranscript,
      titleFromTranscript: vi
        .fn()
        .mockReturnValue(Effect.succeed("TypeScript Magic")),
    }),
    Effect.provideService(ArticleStorageService, articleStorageService),
    Effect.provideService(FileSystem.FileSystem, mockFS),
    Effect.runPromise
  );

  expect(result).toEqual({
    title: "TypeScript Magic",
    filename: "awesome-typescript-video.md",
    content: "test article content",
    savedAt: "/path/to/videos/awesome-typescript-video.md",
  });

  // Verify the file was written to the correct location with correct content
  expect(capturedPath).toBe("/path/to/videos/awesome-typescript-video.md");
  expect(capturedContent).toContain("test article content");
  expect(capturedContent).toContain('title: "TypeScript Magic"');
  expect(capturedContent).toContain('originalVideoPath: "test/fixtures/video.mp4"');
  
  // Verify that the regular article storage was NOT called
  expect(articleStorageService.storeArticle).not.toHaveBeenCalled();
});
