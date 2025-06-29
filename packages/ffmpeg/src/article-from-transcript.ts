import type { AbsolutePath } from "@total-typescript/shared";
import { Clock, Config, Effect } from "effect";
import { AIService, ArticleStorageService } from "./services.js";

export const generateArticleFromTranscript = Effect.fn(
  "generateArticleFromTranscript"
)(function* (opts: { originalVideoPath: AbsolutePath; transcript: string }) {
  const { originalVideoPath, transcript } = opts;

  const ai = yield* AIService;
  const articleStorage = yield* ArticleStorageService;

  const ARTICLES_TO_TAKE = yield* Config.number("ARTICLES_TO_TAKE").pipe(
    Config.withDefault(5)
  );

  const mostRecentArticles = yield* articleStorage.getLatestArticles({
    take: ARTICLES_TO_TAKE,
  });

  const article = yield* ai.articleFromTranscript(
    transcript,
    mostRecentArticles
  );

  yield* articleStorage.storeArticle({
    content: article,
    originalVideoPath,
    date: new Date(),
  });

  return article;
});
