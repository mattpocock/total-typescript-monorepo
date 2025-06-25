import { ConfigError, Context, Effect } from "effect";
import type { FFMPeg } from "./ffmpeg-commands.js";
import type { OpenAI } from "openai";
import type { AbsolutePath } from "@total-typescript/shared";
import type { ReadStream } from "node:fs";
import type { NoOBSFilesFoundError, TakeValueTooHighError } from "./layers.js";

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

export class OBSIntegrationService extends Context.Tag("OBSIntegrationService")<
  OBSIntegrationService,
  {
    getLatestOBSVideo: () => Effect.Effect<
      AbsolutePath,
      ConfigError.ConfigError | NoOBSFilesFoundError
    >;
  }
>() {}

export class ArticleStorageService extends Context.Tag("ArticleStorageService")<
  ArticleStorageService,
  {
    storeArticle: (article: {
      content: string;
      originalVideoPath: AbsolutePath;
      date: Date;
    }) => Effect.Effect<void>;
    getLatestArticles: (
      take: number
    ) => Effect.Effect<Array<string>, TakeValueTooHighError>;
  }
>() {}

export class AIService extends Context.Tag("AIService")<
  AIService,
  {
    articleFromTranscript: (
      transcript: string,
      lastFiveArticles: Array<string>
    ) => Effect.Effect<string>;
  }
>() {}

export class GetLatestFilesInDirectoryService extends Context.Tag(
  "GetLatestFilesInDirectoryService"
)<
  GetLatestFilesInDirectoryService,
  (opts: {
    dir: AbsolutePath;
    extension?: string;
    take?: number;
  }) => Effect.Effect<Array<AbsolutePath>>
>() {}
