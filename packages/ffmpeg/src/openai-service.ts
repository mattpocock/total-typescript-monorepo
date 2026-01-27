import { type AbsolutePath } from "@total-typescript/shared";
import { Config, Effect, Redacted } from "effect";
import type { ReadStream } from "node:fs";
import { createReadStream } from "node:fs";
import { OpenAI } from "openai";

export class OpenAIService extends Effect.Service<OpenAIService>()(
  "OpenAIService",
  {
    effect: Effect.gen(function* () {
      const openaiKey = yield* Config.redacted(Config.string("OPENAI_API_KEY"));
      const openaiClient = new OpenAI({
        apiKey: Redacted.value(openaiKey),
      });

      return openaiClient;
    }),
  },
) {}

export class ReadStreamService extends Effect.Service<ReadStreamService>()(
  "ReadStreamService",
  {
    effect: Effect.gen(function* () {
      return {
        createReadStream: (path: AbsolutePath): Effect.Effect<ReadStream> => {
          return Effect.succeed(createReadStream(path));
        },
      };
    }),
  },
) {}
