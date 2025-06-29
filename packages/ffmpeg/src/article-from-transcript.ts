import { toDashCase, type AbsolutePath } from "@total-typescript/shared";
import { Config, Effect } from "effect";
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

  const PADDED_NUMBER_LENGTH = yield* Config.number(
    "PADDED_NUMBER_LENGTH"
  ).pipe(Config.withDefault(3));

  const mostRecentArticlesFiber = yield* Effect.fork(
    articleStorage.getLatestArticles({
      take: ARTICLES_TO_TAKE,
    })
  );

  const countArticlesFiber = yield* Effect.fork(articleStorage.countArticles());

  const titleFiber = yield* Effect.fork(ai.titleFromTranscript(transcript));

  const articleFiber = yield* Effect.fork(
    Effect.gen(function* () {
      const mostRecentArticles = yield* mostRecentArticlesFiber;
      const article = yield* ai.articleFromTranscript(
        transcript,
        mostRecentArticles
      );
      return article;
    })
  );

  const [article, title, articlesCount] = yield* Effect.all([
    articleFiber,
    titleFiber,
    countArticlesFiber,
  ]);

  yield* articleStorage.storeArticle({
    content: article,
    originalVideoPath,
    date: new Date(),
    title,
    filename: `${(articlesCount + 1).toString().padStart(PADDED_NUMBER_LENGTH, "0")}-${toDashCase(title)}.md`,
  });
});
