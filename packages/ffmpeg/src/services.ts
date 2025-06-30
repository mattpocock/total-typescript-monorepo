import { openai } from "@ai-sdk/openai";
import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import { type AbsolutePath } from "@total-typescript/shared";
import { generateObject, generateText } from "ai";
import { Config, Context, Data, Effect } from "effect";
import fm from "front-matter";
import type { ReadStream } from "node:fs";
import * as realFs from "node:fs/promises";
import path from "node:path";
import type { OpenAI } from "openai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export { FFmpegCommandsService } from "./ffmpeg-commands.js";

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

export class QuestionNotAnsweredError extends Data.TaggedError(
  "QuestionNotAnsweredError"
)<{
  question: string;
}> {}

export class AskQuestionService extends Context.Tag("AskQuestionService")<
  AskQuestionService,
  {
    askQuestion: (
      question: string
    ) => Effect.Effect<string, QuestionNotAnsweredError>;
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
  filename: string;
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

export class CouldNotParseArticleError extends Data.TaggedError(
  "CouldNotParseArticleError"
)<{
  cause: Error;
  filePath: AbsolutePath;
}> {}

export class TranscriptStorageService extends Effect.Service<TranscriptStorageService>()(
  "TranscriptStorageService",
  {
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      const TRANSCRIPTION_DIRECTORY = yield* Config.string(
        "TRANSCRIPTION_DIRECTORY"
      );

      const OBS_OUTPUT_DIRECTORY = yield* Config.string("OBS_OUTPUT_DIRECTORY");

      return {
        storeTranscript: Effect.fn("storeTranscript")(function* (opts: {
          transcript: string;
          // The name of the file, without the extension
          filename: string;
        }) {
          const transcriptPath = path.join(
            TRANSCRIPTION_DIRECTORY,
            opts.filename + ".txt"
          ) as AbsolutePath;

          yield* fs.writeFileString(transcriptPath, opts.transcript);
        }),
        getTranscripts: Effect.fn("getTranscripts")(function* () {
          const files = yield* fs.readDirectory(TRANSCRIPTION_DIRECTORY);
          return files
            .map(
              (file) => path.join(TRANSCRIPTION_DIRECTORY, file) as AbsolutePath
            )
            .sort((a, b) => b.localeCompare(a));
        }),
        getOriginalVideoPathFromTranscript: Effect.fn(
          "getOriginalVideoPathFromTranscript"
        )(function* (opts: { transcriptPath: AbsolutePath }) {
          const parsed = path.parse(opts.transcriptPath);
          return path.join(
            OBS_OUTPUT_DIRECTORY,
            parsed.name + ".mp4"
          ) as AbsolutePath;
        }),
      };
    }),
    dependencies: [NodeFileSystem.layer],
  }
) {}

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
            path.join(ARTICLE_STORAGE_PATH, article.filename),
            [
              "---",
              `date: "${article.date.toISOString()}"`,
              `originalVideoPath: "${article.originalVideoPath}"`,
              `title: "${article.title.replaceAll('"', "")}"`,
              "---",
              "",
              article.content,
            ].join("\n")
          );
        }),
        countArticles: Effect.fn("countArticles")(function* () {
          const files = yield* fs.readDirectory(ARTICLE_STORAGE_PATH);
          return files.filter((file) => file.endsWith(".md")).length;
        }),
        getLatestArticles: Effect.fn("getLatestArticles")(function* (opts: {
          take?: number;
        }) {
          const files = yield* getLatestFilesInDirectory({
            dir: ARTICLE_STORAGE_PATH as AbsolutePath,
          });

          const articles: Article[] = yield* Effect.all(
            files
              .filter((file) => file.endsWith(".md"))
              .slice(0, opts.take)
              .map((file) => {
                return Effect.gen(function* () {
                  const content = yield* fs.readFileString(file);

                  const { attributes, body } = yield* Effect.try(
                    (): {
                      attributes: {
                        date: string;
                        originalVideoPath: string;
                        title: string;
                      };
                      body: string;
                    } => (fm as any)(content)
                  ).pipe(
                    Effect.mapError((e) => {
                      return new CouldNotParseArticleError({
                        cause: e.cause as Error,
                        filePath: file,
                      });
                    }),
                    Effect.andThen(({ attributes, body }) => {
                      if (
                        !attributes?.date ||
                        !attributes?.originalVideoPath ||
                        !attributes?.title
                      ) {
                        return Effect.fail(
                          new CouldNotParseArticleError({
                            cause: new Error("Invalid article format"),
                            filePath: file,
                          })
                        );
                      }
                      return Effect.succeed({ attributes, body });
                    })
                  );
                  return {
                    content: body,
                    originalVideoPath:
                      attributes.originalVideoPath as AbsolutePath,
                    date: new Date(attributes.date),
                    title: attributes.title,
                    filename: path.basename(file),
                  };
                });
              })
          );
          return articles;
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
    const model = anthropic("claude-3-7-sonnet-20250219");
    const fs = yield* FileSystem.FileSystem;

    return {
      askForLinks: Effect.fn("askForLinks")(function* (opts: {
        transcript: string;
      }) {
        const systemRaw = yield* fs.readFileString(
          path.resolve(import.meta.dirname, "../prompts", "ask-for-links.md")
        );

        const links = yield* Effect.tryPromise(() => {
          return generateObject({
            model,
            schema: z.object({
              linkRequests: z
                .array(z.string())
                .describe("The links you want to request"),
            }),
            system: systemRaw,
            prompt: opts.transcript,
          });
        });

        return links.object?.linkRequests;
      }),
      articleFromTranscript: Effect.fn("articleFromTranscript")(
        function* (opts: {
          transcript: string;
          mostRecentArticles: Article[];
          code?: string;
          urls: { request: string; url: string }[];
        }) {
          yield* Effect.logDebug("Generating article from transcript", opts);

          const systemRaw = yield* fs.readFileString(
            path.resolve(
              import.meta.dirname,
              "../prompts",
              "generate-article.md"
            )
          );

          let system = systemRaw.replace(
            "{{articles}}",
            opts.mostRecentArticles
              .map((a) => `# ${a.title}\n\n${a.content}`)
              .join("\n\n")
          );

          if (opts.urls.length > 0) {
            system = system.replace(
              "{{urls}}",
              opts.urls.map((u) => `- ${u.request}: ${u.url}`).join("\n")
            );
          } else {
            system = system.replace("{{urls}}", "No links provided");
          }

          yield* Effect.logDebug("System", system);

          if (opts.code) {
            system = system.replace(
              "{{code}}",
              `\`\`\`ts\n${opts.code}\n\`\`\``
            );
          } else {
            system = system.replace("{{code}}", "No code provided");
          }

          const article = yield* Effect.tryPromise(() => {
            return generateText({
              model,
              system,
              prompt: opts.transcript,
            });
          });

          return article.text;
        }
      ),
      titleFromTranscript: Effect.fn("titleFromTranscript")(function* (opts: {
        transcript: string;
        code?: string;
      }) {
        yield* Effect.logDebug("Generating title from transcript", opts);

        const systemRaw = yield* fs.readFileString(
          path.resolve(import.meta.dirname, "../prompts", "generate-title.md")
        );

        let system = systemRaw;

        if (opts.code) {
          system = system.replace("{{code}}", `\`\`\`ts\n${opts.code}\n\`\`\``);
        } else {
          system = system.replace("{{code}}", "No code provided");
        }

        const title = yield* Effect.tryPromise(() => {
          return generateText({
            model,
            system,
            prompt: opts.transcript,
          });
        });

        return title.text;
      }),
    };
  }),
  dependencies: [NodeFileSystem.layer],
}) {}

export class LinksStorageService extends Effect.Service<LinksStorageService>()(
  "LinksStorageService",
  {
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const LINKS_STORAGE_PATH = yield* Config.string("LINKS_STORAGE_PATH");

      const getLinks = Effect.fn("getLinks")(function* () {
        // Check if file exists, if not return empty array
        const exists = yield* fs.exists(LINKS_STORAGE_PATH);
        if (!exists) {
          return [];
        }

        const linksContent = yield* fs.readFileString(LINKS_STORAGE_PATH);

        // Handle empty file case
        if (!linksContent.trim()) {
          return [];
        }

        try {
          return JSON.parse(linksContent) as Array<{
            description: string;
            url: string;
          }>;
        } catch (error) {
          // If JSON parsing fails, return empty array
          yield* Effect.logWarning(
            "Failed to parse links JSON, returning empty array",
            { error }
          );
          return [];
        }
      });

      const addLinks = Effect.fn("addLinks")(function* (
        links: {
          description: string;
          url: string;
        }[]
      ) {
        const existingLinks = yield* getLinks();
        const updatedLinks = [...existingLinks, ...links];
        yield* fs.writeFileString(
          LINKS_STORAGE_PATH,
          JSON.stringify(updatedLinks, null, 2)
        );
      });

      return {
        getLinks,
        addLinks,
      };
    }),
    dependencies: [NodeFileSystem.layer],
  }
) {}
