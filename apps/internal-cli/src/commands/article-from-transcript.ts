import { FileSystem } from "@effect/platform";
import { NodeRuntime } from "@effect/platform-node";
import {
  AppLayerLive,
  generateArticleFromTranscript,
} from "@total-typescript/ffmpeg";
import type { Command } from "commander";
import { ConfigProvider, Effect, Layer } from "effect";
import path from "node:path";
import {
  AIService,
  AskQuestionService,
  TranscriptStorageService,
} from "../../../../packages/ffmpeg/dist/services.js";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(program: Command): void {
  program
    .command("article-from-transcript")
    .aliases(["aft", "article"])
    .description("Generate an article from a transcript")
    .action(async () => {
      const program = Effect.gen(function* () {
        const transcriptStorage = yield* TranscriptStorageService;
        const askQuestion = yield* AskQuestionService;
        const ai = yield* AIService;
        const transcripts = yield* transcriptStorage.getSubtitleFiles();
        const fs = yield* FileSystem.FileSystem;

        const transcriptPath = yield* askQuestion.select(
          "Select a transcript",
          transcripts.map((p) => ({
            title: path.basename(p),
            value: p,
          })),
        );

        let code: string | undefined;

        const codePath = yield* askQuestion.askQuestion(
          "Enter the file path containing any code for the article (optional)",
        );

        if (codePath) {
          const codeContent = yield* fs.readFileString(codePath);
          code = codeContent;
        }

        const transcriptContent = yield* fs.readFileString(transcriptPath);

        const originalVideoPath =
          yield* transcriptStorage.getOriginalVideoPathFromTranscript({
            transcriptPath: transcriptPath,
          });

        const urls: { request: string; url: string }[] = [];

        const urlRequests = yield* ai.askForLinks({
          transcript: transcriptContent,
        });

        for (const urlRequest of urlRequests) {
          const url = yield* askQuestion.askQuestion(urlRequest);
          urls.push({ request: urlRequest, url });
        }

        yield* generateArticleFromTranscript({
          originalVideoPath,
          transcript: transcriptContent,
          code,
          urls,
        });
      });

      await program.pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(MainLayerLive),
        NodeRuntime.runMain,
      );
    });
}
