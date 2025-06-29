import { ConfigProvider, Effect } from "effect";
import { expect, it, vi } from "vitest";
import {
  ArticleStorageService,
  CouldNotParseArticleError,
  GetLatestFilesInDirectoryService,
} from "./services.js";
import type { AbsolutePath } from "@total-typescript/shared";
import { FileSystem } from "@effect/platform";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { NodeFileSystem } from "@effect/platform-node";

it("should store an article", async () => {
  const article = {
    title: "hello-world",
    content: "Hello, world!",
    originalVideoPath: "path/to/video.mp4" as AbsolutePath,
    date: new Date(),
  };

  const writeFileString = vi.fn().mockReturnValue(Effect.succeed(undefined));

  await Effect.gen(function* () {
    const articleStorage = yield* ArticleStorageService;
    yield* articleStorage.storeArticle(article);
  }).pipe(
    Effect.provide(ArticleStorageService.DefaultWithoutDependencies),
    Effect.provide(
      FileSystem.layerNoop({
        writeFileString,
      })
    ),
    Effect.provide(GetLatestFilesInDirectoryService.Default),
    Effect.withConfigProvider(
      ConfigProvider.fromJson({
        ARTICLE_STORAGE_PATH: "/mnt/d/articles",
      })
    ),
    Effect.runPromise
  );

  expect(writeFileString).toHaveBeenCalledWith(
    "/mnt/d/articles/hello-world.md",
    [
      "---",
      `date: ${article.date.toISOString()}`,
      `originalVideoPath: ${article.originalVideoPath}`,
      "---",
      "",
      article.content,
    ].join("\n")
  );
});

it("should get the latest articles", async () => {
  const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));

  const files = [
    {
      filePath: path.join(tmpdir, "001-me-second.md"),
    },
    {
      filePath: path.join(tmpdir, "999-me-first.md"),
    },
  ];

  for (const file of files) {
    writeFileSync(
      file.filePath,
      [
        "---",
        `date: "${new Date().toISOString()}"`,
        `originalVideoPath: "${file.filePath}"`,
        "---",
        "",
        "Hello, world!",
      ].join("\n")
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  try {
    const articles = await Effect.gen(function* () {
      const articleStorage = yield* ArticleStorageService;
      const articles = yield* articleStorage.getLatestArticles({ take: 5 });

      return articles;
    }).pipe(
      Effect.provide(ArticleStorageService.Default),
      Effect.provide(NodeFileSystem.layer),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          ARTICLE_STORAGE_PATH: tmpdir,
        })
      ),
      Effect.runPromise
    );

    expect(articles).toEqual([
      expect.objectContaining({
        title: "999-me-first",
        content: "Hello, world!",
        originalVideoPath: expect.stringContaining("999-me-first.md"),
        date: expect.any(Date),
      }),
      expect.objectContaining({
        title: "001-me-second",
        content: "Hello, world!",
        originalVideoPath: expect.stringContaining("001-me-second.md"),
        date: expect.any(Date),
      }),
    ]);
  } finally {
    rmSync(tmpdir, { recursive: true });
  }
});

it("should fail when the article is not in a valid format", async () => {
  const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));

  const files = [
    {
      filePath: path.join(tmpdir, "001-me-second.md"),
      content: "",
    },
  ];

  for (const file of files) {
    writeFileSync(file.filePath, file.content);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  try {
    const error = await Effect.gen(function* () {
      const articleStorage = yield* ArticleStorageService;
      const articles = yield* articleStorage.getLatestArticles({ take: 5 });

      return articles;
    }).pipe(
      Effect.provide(ArticleStorageService.Default),
      Effect.provide(NodeFileSystem.layer),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          ARTICLE_STORAGE_PATH: tmpdir,
        })
      ),
      Effect.flip,
      Effect.runPromise
    );

    expect(error).toBeInstanceOf(CouldNotParseArticleError);
  } finally {
    rmSync(tmpdir, { recursive: true });
  }
});
