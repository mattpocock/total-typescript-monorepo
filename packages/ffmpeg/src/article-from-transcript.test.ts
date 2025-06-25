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
  };

  const article = await generateArticleFromTranscript({
    originalVideoPath: "test/fixtures/video.mp4" as AbsolutePath,
    transcript: "test/fixtures/transcript.txt",
  }).pipe(
    Effect.provideService(AIService, {
      articleFromTranscript,
    }),
    Effect.provideService(ArticleStorageService, articleStorageService),
    Effect.runPromise
  );

  expect(articleFromTranscript).toHaveBeenCalledWith(
    "test/fixtures/transcript.txt",
    []
  );

  expect(articleStorageService.storeArticle).toHaveBeenCalledWith({
    content: "test",
    originalVideoPath: "test/fixtures/video.mp4",
    date: expect.any(Date),
  });

  expect(article).toBe("test");
});
