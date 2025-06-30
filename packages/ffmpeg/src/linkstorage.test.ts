import { ConfigProvider, Effect } from "effect";
import { expect, it } from "vitest";
import { LinksStorageService } from "./services.js";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { NodeFileSystem } from "@effect/platform-node";

it("should get empty array when file does not exist", async () => {
  const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));
  const linksPath = path.join(tmpdir, "links.json");

  try {
    const links = await Effect.gen(function* () {
      const linksStorage = yield* LinksStorageService;
      return yield* linksStorage.getLinks();
    }).pipe(
      Effect.provide(LinksStorageService.Default),
      Effect.provide(NodeFileSystem.layer),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          LINKS_STORAGE_PATH: linksPath,
        })
      ),
      Effect.runPromise
    );

    expect(links).toEqual([]);
  } finally {
    rmSync(tmpdir, { recursive: true });
  }
});

it("should get empty array when file is empty", async () => {
  const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));
  const linksPath = path.join(tmpdir, "links.json");

  // Create empty file
  writeFileSync(linksPath, "");

  try {
    const links = await Effect.gen(function* () {
      const linksStorage = yield* LinksStorageService;
      return yield* linksStorage.getLinks();
    }).pipe(
      Effect.provide(LinksStorageService.Default),
      Effect.provide(NodeFileSystem.layer),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          LINKS_STORAGE_PATH: linksPath,
        })
      ),
      Effect.runPromise
    );

    expect(links).toEqual([]);
  } finally {
    rmSync(tmpdir, { recursive: true });
  }
});

it("should get links from existing JSON file", async () => {
  const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));
  const linksPath = path.join(tmpdir, "links.json");

  const existingLinks = [
    {
      description: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/",
    },
    { description: "Effect Documentation", url: "https://effect.website/" },
  ];

  // Create file with existing links
  writeFileSync(linksPath, JSON.stringify(existingLinks, null, 2));

  try {
    const links = await Effect.gen(function* () {
      const linksStorage = yield* LinksStorageService;
      return yield* linksStorage.getLinks();
    }).pipe(
      Effect.provide(LinksStorageService.Default),
      Effect.provide(NodeFileSystem.layer),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          LINKS_STORAGE_PATH: linksPath,
        })
      ),
      Effect.runPromise
    );

    expect(links).toEqual(existingLinks);
  } finally {
    rmSync(tmpdir, { recursive: true });
  }
});

it("should add links to existing storage", async () => {
  const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));
  const linksPath = path.join(tmpdir, "links.json");

  const existingLinks = [
    {
      description: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/",
    },
  ];

  // Create initial file
  writeFileSync(linksPath, JSON.stringify(existingLinks, null, 2));

  const newLinks = [
    { description: "Effect Documentation", url: "https://effect.website/" },
    { description: "Node.js Docs", url: "https://nodejs.org/docs/" },
  ];

  try {
    await Effect.gen(function* () {
      const linksStorage = yield* LinksStorageService;
      yield* linksStorage.addLinks(newLinks);
    }).pipe(
      Effect.provide(LinksStorageService.Default),
      Effect.provide(NodeFileSystem.layer),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          LINKS_STORAGE_PATH: linksPath,
        })
      ),
      Effect.runPromise
    );

    // Read the file to verify it was updated
    const updatedContent = JSON.parse(readFileSync(linksPath, "utf-8"));
    const expectedLinks = [...existingLinks, ...newLinks];

    expect(updatedContent).toEqual(expectedLinks);
  } finally {
    rmSync(tmpdir, { recursive: true });
  }
});

it("should create file and add links when file does not exist", async () => {
  const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));
  const linksPath = path.join(tmpdir, "links.json");

  const newLinks = [
    {
      description: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/",
    },
    { description: "Effect Documentation", url: "https://effect.website/" },
  ];

  try {
    await Effect.gen(function* () {
      const linksStorage = yield* LinksStorageService;
      yield* linksStorage.addLinks(newLinks);
    }).pipe(
      Effect.provide(LinksStorageService.Default),
      Effect.provide(NodeFileSystem.layer),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          LINKS_STORAGE_PATH: linksPath,
        })
      ),
      Effect.runPromise
    );

    // Read the file to verify it was created
    const updatedContent = JSON.parse(readFileSync(linksPath, "utf-8"));
    expect(updatedContent).toEqual(newLinks);
  } finally {
    rmSync(tmpdir, { recursive: true });
  }
});

it("should handle invalid JSON gracefully", async () => {
  const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));
  const linksPath = path.join(tmpdir, "links.json");

  // Create file with invalid JSON
  writeFileSync(linksPath, "invalid json content");

  try {
    const links = await Effect.gen(function* () {
      const linksStorage = yield* LinksStorageService;
      return yield* linksStorage.getLinks();
    }).pipe(
      Effect.provide(LinksStorageService.Default),
      Effect.provide(NodeFileSystem.layer),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          LINKS_STORAGE_PATH: linksPath,
        })
      ),
      Effect.runPromise
    );

    expect(links).toEqual([]);
  } finally {
    rmSync(tmpdir, { recursive: true });
  }
});

it("should get links after adding them", async () => {
  const tmpdir = mkdtempSync(path.join(import.meta.dirname, "tmp"));
  const linksPath = path.join(tmpdir, "links.json");

  const links = [
    {
      description: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/",
    },
    { description: "Effect Documentation", url: "https://effect.website/" },
  ];

  try {
    // First add links
    await Effect.gen(function* () {
      const linksStorage = yield* LinksStorageService;
      yield* linksStorage.addLinks(links);
    }).pipe(
      Effect.provide(LinksStorageService.Default),
      Effect.provide(NodeFileSystem.layer),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          LINKS_STORAGE_PATH: linksPath,
        })
      ),
      Effect.runPromise
    );

    // Then get links
    const retrievedLinks = await Effect.gen(function* () {
      const linksStorage = yield* LinksStorageService;
      return yield* linksStorage.getLinks();
    }).pipe(
      Effect.provide(LinksStorageService.Default),
      Effect.provide(NodeFileSystem.layer),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          LINKS_STORAGE_PATH: linksPath,
        })
      ),
      Effect.runPromise
    );

    expect(retrievedLinks).toEqual(links);
  } finally {
    rmSync(tmpdir, { recursive: true });
  }
});
