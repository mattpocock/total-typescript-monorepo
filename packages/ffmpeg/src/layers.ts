import { NodeFileSystem } from "@effect/platform-node";
import { Config, Effect, Layer, Redacted } from "effect";
import { createReadStream } from "node:fs";
import OpenAI from "openai";
import prompts from "prompts";
import {
  AIService,
  ArticleStorageService,
  AskQuestionService,
  FFmpegCommandsService,
  OBSIntegrationService,
  OpenAIService,
  QuestionNotAnsweredError,
  ReadStreamService,
  TranscriptStorageService,
} from "./services.js";

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
      const response = await prompts({
        type: "text",
        name: "value",
        message: question,
      });

      return response.value;
    }).pipe(
      Effect.andThen((val) => {
        if (!val) {
          return Effect.fail(new QuestionNotAnsweredError({ question }));
        }
        return Effect.succeed(val);
      })
    ),

  select: (question, choices) => {
    return Effect.promise(async () => {
      const response = await prompts({
        type: "select",
        name: "value",
        message: question,
        choices,
      });
      return response.value;
    });
  },
});

export const AppLayerLive = Layer.mergeAll(
  FFmpegCommandsService.Default,
  OpenAILayerLive,
  ReadStreamLayerLive,
  AskQuestionLayerLive,
  ArticleStorageService.Default,
  OBSIntegrationService.Default,
  TranscriptStorageService.Default,
  AIService.Default,
  NodeFileSystem.layer
);
