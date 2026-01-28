import { FileSystem } from "@effect/platform";
import { NodeRuntime } from "@effect/platform-node";
import {
  AppLayerLive,
  AskQuestionService,
  createAutoEditedVideoQueueItems,
  OBSIntegrationService,
  QueueUpdaterService,
  validateWindowsFilename,
} from "@total-typescript/ffmpeg";
import type { Command } from "commander";
import { ConfigProvider, Console, Effect, Layer } from "effect";
import { OpenTelemetryLive } from "../tracing.js";
import {
  FlagValidationError,
  validateCreateVideoFlags,
} from "../validate-cli-flags.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(program: Command): void {
  program
    .command("create-auto-edited-video")
    .aliases(["v", "video"])
    .description(
      `Create a new auto-edited video from the latest OBS recording and save it to the export directory`,
    )
    .option("-u, --upload", "Upload to shorts directory")
    .option("-ns, --no-subtitles", "Disable subtitle rendering")
    .option(
      "-ga, --generate-article",
      "Automatically generate an article from the video transcript",
    )
    .option(
      "-a, --alongside",
      "Save generated article alongside the video (with video's name) instead of in article storage directory",
    )
    .action(
      async (options: {
        upload?: boolean;
        subtitles?: boolean;
        generateArticle?: boolean;
        alongside?: boolean;
      }) => {
        await Effect.gen(function* () {
          const queueUpdater = yield* QueueUpdaterService;
          const obs = yield* OBSIntegrationService;
          const askQuestion = yield* AskQuestionService;

          const inputVideo = yield* obs.getLatestOBSVideo();

          yield* Console.log("Adding to queue...");

          // Validate flag combinations
          yield* validateCreateVideoFlags(options).pipe(
            Effect.catchAll((error: FlagValidationError) =>
              Effect.gen(function* () {
                yield* Console.error(error.errorMessage);
                for (const helpMessage of error.helpMessages) {
                  yield* Console.log(helpMessage);
                }
                process.exit(1);
              }),
            ),
          );

          const videoName = yield* askQuestion.askQuestion(
            "What is the name of the video?",
          );

          yield* validateWindowsFilename(videoName);

          // If article generation is enabled, ask for code file synchronously
          let codeContent = "";
          let codePath = "";

          if (options.generateArticle) {
            yield* Console.log("📝 Article generation enabled");

            const fs = yield* FileSystem.FileSystem;
            const providedCodePath = yield* askQuestion.askQuestion(
              "📂 Code file path (optional, press Enter to skip): ",
              { optional: true },
            );

            if (providedCodePath.trim()) {
              codePath = providedCodePath.trim();
              const codeExists = yield* fs
                .exists(codePath)
                .pipe(Effect.catchAll(() => Effect.succeed(false)));

              if (codeExists) {
                codeContent = yield* fs.readFileString(codePath).pipe(
                  Effect.catchAll((error) => {
                    return Effect.gen(function* () {
                      yield* Console.log(
                        `⚠️  Warning: Could not read code file ${codePath}: ${error}`,
                      );
                      yield* Console.log(
                        `💡 Tip: Check file permissions and ensure the path is correct`,
                      );
                      return "";
                    });
                  }),
                );
                yield* Console.log(
                  `✅ Code file loaded: ${codePath} (${codeContent.length} characters)`,
                );
              } else {
                yield* Console.log(
                  `⚠️  Warning: Code file ${codePath} does not exist`,
                );
                yield* Console.log(
                  `💡 Continuing without code - you can manually add code examples to the article later`,
                );
                codePath = ""; // Reset path if file doesn't exist
              }
            } else {
              yield* Console.log(
                `ℹ️  No code file provided - continuing without code examples`,
              );
            }
          }

          const queueItems = yield* createAutoEditedVideoQueueItems({
            inputVideo,
            videoName,
            subtitles: Boolean(options.subtitles),
            dryRun: !Boolean(options.upload),
            generateArticle: Boolean(options.generateArticle),
            alongside: Boolean(options.alongside),
            codeContent,
            codePath,
          });

          if (options.generateArticle) {
            yield* Console.log(
              "Article generation enabled - adding workflow queue items...",
            );
            if (options.alongside) {
              yield* Console.log(
                "Article will be saved alongside the video instead of in article storage directory.",
              );
            }
          }

          yield* queueUpdater.writeToQueue(queueItems);

          if (options.generateArticle) {
            yield* Console.log(
              `Added ${queueItems.length} items to queue for video processing with article generation.`,
            );
          } else {
            yield* Console.log("Added video processing item to queue.");
          }
        }).pipe(
          Effect.catchAll((e) => {
            return Effect.gen(function* () {
              yield* Effect.logError(e);
              yield* Effect.sleep(5000);
              return yield* Effect.die(e);
            });
          }),
          Effect.withConfigProvider(ConfigProvider.fromEnv()),
          Effect.provide(MainLayerLive),
          NodeRuntime.runMain,
        );
      },
    );
}
