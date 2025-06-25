import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import type { AbsolutePath } from "@total-typescript/shared";
import { Config, Data, Effect, Layer, Redacted } from "effect";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline/promises";
import OpenAI from "openai";
import * as ffmpeg from "./ffmpeg-commands.js";
import {
  AskQuestionService,
  FFmpegCommandsService,
  GetLatestFilesInDirectoryService,
  OBSIntegrationService,
  OpenAIService,
  ReadStreamService,
} from "./services.js";

export const FFmpegCommandsLayerLive = Layer.succeed(
  FFmpegCommandsService,
  ffmpeg
);

export const OpenAILayerLive = Layer.effect(
  OpenAIService,
  Effect.gen(function* () {
    const openaiKey = yield* Config.redacted(Config.string("OPENAI_API_KEY"));
    return new OpenAI({
      apiKey: Redacted.value(openaiKey),
    });
  })
);

export const ReadStreamLayerLive = Layer.succeed(ReadStreamService, {
  createReadStream: (path) => Effect.succeed(createReadStream(path)),
});

export const AskQuestionLayerLive = Layer.succeed(AskQuestionService, {
  askQuestion: (question) =>
    Effect.promise(async () => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer = await rl.question(question);
      rl.close();
      return answer;
    }),
  select: (question, choices) => {
    throw new Error("Not implemented");
  },
});

const GetLatestFilesInDirectoryLayerLive = Layer.succeed(
  GetLatestFilesInDirectoryService,
  () => {
    // TODO
    return Effect.succeed([]);
  }
);

export class NoOBSFilesFoundError extends Data.TaggedError(
  "NoOBSFilesFoundError"
)<{
  dir: AbsolutePath;
}> {}

export const OBSIntegrationLayerLive = Layer.effect(
  OBSIntegrationService,
  Effect.gen(function* () {
    const obsOutputDirectory = yield* Config.string("OBS_OUTPUT_DIRECTORY");
    const OBS_FILE_EXTENSION = yield* Config.string("OBS_FILE_EXTENSION");

    const getLatestFilesInDirectory = yield* GetLatestFilesInDirectoryService;

    return {
      getLatestOBSVideo: () =>
        Effect.gen(function* () {
          const files = yield* getLatestFilesInDirectory({
            dir: obsOutputDirectory as AbsolutePath,
            extension: OBS_FILE_EXTENSION,
            take: 1,
          });

          if (!files[0]) {
            return yield* Effect.fail(
              new NoOBSFilesFoundError({
                dir: obsOutputDirectory as AbsolutePath,
              })
            );
          }

          return files[0];
        }),
    };
  })
).pipe(Layer.provide(GetLatestFilesInDirectoryLayerLive));

export class TakeValueTooHighError extends Data.TaggedError(
  "TakenValueTooHigh"
)<{
  take: number;
}> {}

export class ArticleStorageService extends Effect.Service<ArticleStorageService>()(
  "ArticleStorageService",
  {
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      const articlesDir = yield* Config.string("ARTICLES_DIRECTORY");

      const getLatestFilesInDirectory = yield* GetLatestFilesInDirectoryService;

      const files = yield* getLatestFilesInDirectory({
        dir: articlesDir as AbsolutePath,
        extension: "md",
        take: 20,
      });

      return {
        storeArticle: (article: {
          content: string;
          originalVideoPath: AbsolutePath;
          date: Date;
        }) =>
          Effect.gen(function* () {
            yield* fs.writeFileString(
              article.originalVideoPath,
              article.content
            );
          }),
        getLatestArticles: (take: number) => {
          return Effect.gen(function* () {
            if (files.length < take) {
              return yield* Effect.fail(new TakeValueTooHighError({ take }));
            }

            return files.slice(0, take);
          });
        },
      };
    }),
    dependencies: [GetLatestFilesInDirectoryLayerLive, NodeFileSystem.layer],
  }
) {}

export const AppLayerLive = Layer.mergeAll(
  FFmpegCommandsLayerLive,
  OpenAILayerLive,
  ReadStreamLayerLive,
  AskQuestionLayerLive,
  GetLatestFilesInDirectoryLayerLive,
  OBSIntegrationLayerLive,
  ArticleStorageService.Default,
  NodeFileSystem.layer
);
