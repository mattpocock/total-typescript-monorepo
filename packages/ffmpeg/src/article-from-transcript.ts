import { toDashCase, type AbsolutePath } from "@total-typescript/shared";
import { Config, Effect } from "effect";
import { AIService, ArticleStorageService } from "./services.js";
import { FileSystem } from "@effect/platform";
import path from "node:path";

/**
 * Core article generation logic shared between interactive and queue modes
 */
export const generateArticleCore = Effect.fn("generateArticleCore")(
  function* (opts: {
    originalVideoPath: AbsolutePath;
    transcript: string;
    urls: { request: string; url: string }[];
    code?: string;
    storageMode?: "article-storage" | "alongside-video";
    videoDirectory?: string;
    videoName?: string;
    transcriptPath?: AbsolutePath;
    codePath?: string;
  }) {
    const { originalVideoPath, transcript, code, urls, storageMode = "article-storage", videoDirectory, videoName, transcriptPath, codePath } = opts;

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

    const titleFiber = yield* Effect.fork(
      ai.titleFromTranscript({
        transcript,
        code,
      })
    );

    const articleFiber = yield* Effect.fork(
      Effect.gen(function* () {
        const mostRecentArticles = yield* mostRecentArticlesFiber;
        const article = yield* ai.articleFromTranscript({
          transcript,
          mostRecentArticles,
          code,
          urls,
        });
        return article;
      })
    );

    const [article, title, articlesCount] = yield* Effect.all([
      articleFiber,
      titleFiber,
      countArticlesFiber,
    ]);

    if (storageMode === "alongside-video" && videoDirectory && videoName) {
      // Save files directly alongside the video with new naming pattern
      const fs = yield* FileSystem.FileSystem;
      
      // Ensure the video directory exists
      yield* fs.makeDirectory(videoDirectory, { recursive: true });
      
      // Save the article alongside the video
      const articlePath = path.join(videoDirectory, `${videoName}.article.md`) as AbsolutePath;
      yield* fs.writeFileString(
        articlePath,
        [
          "---",
          `date: "${new Date().toISOString()}"`,
          `originalVideoPath: "${originalVideoPath}"`,
          `title: "${title.replaceAll('"', "")}"`,
          "---",
          "",
          article,
        ].join("\n")
      );

      // Copy the transcript alongside the video if available
      if (transcriptPath) {
        const transcriptAlongsidePath = path.join(videoDirectory, `${videoName}.transcript.txt`);
        yield* fs.copyFile(transcriptPath, transcriptAlongsidePath);
      }

      // Save the code file alongside the video if provided
      if (codePath && code) {
        // Extract the extension from the original code path
        const codeExtension = path.extname(codePath);
        const codeAlongsidePath = path.join(videoDirectory, `${videoName}.code${codeExtension}`);
        yield* fs.writeFileString(codeAlongsidePath, code);
      }

      return {
        title,
        filename: `${videoName}.article.md`,
        content: article,
        savedAt: articlePath,
      };
    } else {
      // Use the existing article storage system
      const filename = `${(articlesCount + 1).toString().padStart(PADDED_NUMBER_LENGTH, "0")}-${toDashCase(title)}.md`;

      yield* articleStorage.storeArticle({
        content: article,
        originalVideoPath,
        date: new Date(),
        title,
        filename,
      });

      return {
        title,
        filename,
        content: article,
      };
    }
  }
);

/**
 * Interactive article generation for CLI usage
 */
export const generateArticleFromTranscript = Effect.fn(
  "generateArticleFromTranscript"
)(function* (opts: {
  originalVideoPath: AbsolutePath;
  transcript: string;
  urls: { request: string; url: string }[];
  code?: string;
}) {
  yield* generateArticleCore(opts);
});

/**
 * Generate article alongside the video in the same directory
 */
export const generateArticleAlongsideVideo = Effect.fn(
  "generateArticleAlongsideVideo"
)(function* (opts: {
  originalVideoPath: AbsolutePath;
  transcript: string;
  urls: { request: string; url: string }[];
  code?: string;
  videoDirectory: string;
  videoName: string;
  transcriptPath?: AbsolutePath;
  codePath?: string;
}) {
  const { videoDirectory, videoName, transcriptPath, codePath, ...coreOpts } = opts;
  
  yield* generateArticleCore({
    ...coreOpts,
    storageMode: "alongside-video",
    videoDirectory,
    videoName,
    transcriptPath,
    codePath,
  });
});
