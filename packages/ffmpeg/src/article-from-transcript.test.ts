// @ts-nocheck

import type { AbsolutePath } from "@total-typescript/shared";
import { Clock, Effect } from "effect";
import { expect, it, vi } from "vitest";
import { generateArticleFromTranscript } from "./article-from-transcript.js";
import { AIService, ArticleStorageService } from "./services.js";

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
  });

  expect(articleStorageService.storeArticle).toHaveBeenCalledWith({
    content: "test",
    originalVideoPath: "test/fixtures/video.mp4",
    date: expect.any(Date),
    title: "My Wonderful Article",
    filename: "001-my-wonderful-article.md",
  });
});
