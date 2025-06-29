import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import type { AbsolutePath } from "@total-typescript/shared";
import { Config, Context, Data, Effect } from "effect";
import type { ReadStream } from "node:fs";
import * as realFs from "node:fs/promises";
import path from "node:path";
import type { OpenAI } from "openai";
import type { FFMPeg } from "./ffmpeg-commands.js";

export class FFmpegCommandsService extends Context.Tag("FFmpegCommandsService")<
  FFmpegCommandsService,
  FFMPeg
>() {}

export class OpenAIService extends Context.Tag("OpenAIService")<
  OpenAIService,
  OpenAI
>() {}

export class ReadStreamService extends Context.Tag("ReadStreamService")<
  ReadStreamService,
  {
    createReadStream: (path: AbsolutePath) => Effect.Effect<ReadStream>;
  }
>() {}

export class AskQuestionService extends Context.Tag("AskQuestionService")<
  AskQuestionService,
  {
    askQuestion: (question: string) => Effect.Effect<string>;
    select: <T>(
      question: string,
      choices: Array<{ title: string; value: T }>
    ) => Effect.Effect<T>;
  }
>() {}

export class NoOBSFilesFoundError extends Data.TaggedError(
  "NoOBSFilesFoundError"
)<{
  dir: string;
}> {}

export type Article = {
  content: string;
  originalVideoPath: AbsolutePath;
  date: Date;
  title: string;
};

export class ReadDirectoryError extends Data.TaggedError("ReadDirectoryError")<{
  cause: Error;
}> {}

export class GetLatestFilesInDirectoryService extends Effect.Service<GetLatestFilesInDirectoryService>()(
  "GetLatestFilesInDirectoryService",
  {
    succeed: Effect.fn("readDirectory")(function* (opts: {
      dir: AbsolutePath;
      recursive?: boolean;
    }) {
      const fs = yield* FileSystem.FileSystem;

      const files = yield* Effect.tryPromise(() =>
        realFs.readdir(opts.dir, {
          recursive: opts.recursive,
        })
      ).pipe(Effect.mapError((e) => new ReadDirectoryError({ cause: e })));

      const filesWithStats = yield* Effect.all(
        files.map((file) => {
          return Effect.gen(function* () {
            const filePath = path.join(opts.dir, file) as AbsolutePath;

            const stats = yield* fs.stat(filePath);

            const mtime = yield* stats.mtime.pipe(
              Effect.mapError(
                (e) => new CouldNotGetMTimeError({ cause: e, filePath })
              )
            );

            return {
              filePath,
              mtime,
            };
          });
        })
      );

      return (
        filesWithStats
          // Sort by mtime descending
          .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
          // Sort by filePath ascending
          .map((file) => file.filePath)
      );
    }),
  }
) {}

export class OBSIntegrationService extends Effect.Service<OBSIntegrationService>()(
  "OBSIntegrationService",
  {
    effect: Effect.gen(function* () {
      const getLatestFilesInDirectory = yield* GetLatestFilesInDirectoryService;

      return {
        getLatestOBSVideo: Effect.fn("getLatestOBSVideo")(function* () {
          const obsOutputDirectory = yield* Config.string(
            "OBS_OUTPUT_DIRECTORY"
          );
          const files = yield* getLatestFilesInDirectory({
            dir: obsOutputDirectory as AbsolutePath,
          });

          if (!files[0]) {
            return yield* new NoOBSFilesFoundError({
              dir: obsOutputDirectory,
            });
          }

          return files[0]!;
        }),
      };
    }),
    dependencies: [GetLatestFilesInDirectoryService.Default],
  }
) {}

export class CouldNotGetMTimeError extends Data.TaggedError(
  "CouldNotGetMTimeError"
)<{
  cause: Error;
  filePath: AbsolutePath;
}> {}

export class ArticleStorageService extends Effect.Service<ArticleStorageService>()(
  "ArticleStorageService",
  {
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      const getLatestFilesInDirectory = yield* GetLatestFilesInDirectoryService;

      const ARTICLE_STORAGE_PATH = yield* Config.string("ARTICLE_STORAGE_PATH");

      return {
        storeArticle: Effect.fn("storeArticle")(function* (article: Article) {
          yield* fs.writeFileString(
            path.join(ARTICLE_STORAGE_PATH, `${article.title}.md`),
            [
              "---",
              `date: ${article.date.toISOString()}`,
              `originalVideoPath: ${article.originalVideoPath}`,
              "---",
              "",
              article.content,
            ].join("\n")
          );
        }),
        getLatestArticles: Effect.fn("getLatestArticles")(function* (opts: {
          take?: number;
        }) {
          const files = yield* getLatestFilesInDirectory({
            dir: ARTICLE_STORAGE_PATH as AbsolutePath,
          });

          return files.slice(0, opts.take);
        }),
      };
    }),
    dependencies: [
      NodeFileSystem.layer,
      GetLatestFilesInDirectoryService.Default,
    ],
  }
) {}

export class AIService extends Effect.Service<AIService>()("AIService", {
  effect: Effect.gen(function* () {
    return {};
  }),
}) {}
