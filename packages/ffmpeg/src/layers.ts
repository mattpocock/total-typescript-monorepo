import { Config, Effect, Layer, Redacted } from "effect";
import { createReadStream } from "node:fs";
import OpenAI from "openai";
import * as ffmpeg from "./ffmpeg-commands.js";
import {
  AskQuestionService,
  FFmpegCommandsService,
  OBSIntegrationService,
  OpenAIService,
  ReadStreamService,
} from "./services.js";
import { getLatestOBSVideo } from "./obs-integration.js";
import { createInterface } from "node:readline/promises";
import { NodeFileSystem } from "@effect/platform-node";

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

export const OBSIntegrationLayerLive = Layer.succeed(OBSIntegrationService, {
  getLatestOBSVideo: () =>
    getLatestOBSVideo().pipe(Effect.catchAll((e) => Effect.die(e))),
});

export const AppLayerLive = Layer.mergeAll(
  FFmpegCommandsLayerLive,
  OpenAILayerLive,
  ReadStreamLayerLive,
  AskQuestionLayerLive,
  OBSIntegrationLayerLive,
  NodeFileSystem.layer
);
