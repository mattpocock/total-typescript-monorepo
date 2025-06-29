import { NodeFileSystem } from "@effect/platform-node";
import { Config, Effect, Layer, Redacted } from "effect";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline/promises";
import OpenAI from "openai";
import * as ffmpeg from "./ffmpeg-commands.js";
import {
  ArticleStorageService,
  AskQuestionService,
  FFmpegCommandsService,
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

export const AppLayerLive = Layer.mergeAll(
  FFmpegCommandsLayerLive,
  OpenAILayerLive,
  ReadStreamLayerLive,
  AskQuestionLayerLive,
  ArticleStorageService.Default,
  OBSIntegrationService.Default,
  NodeFileSystem.layer
);
