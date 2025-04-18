import {
  SCRIPTKIT_VSCODE_LOCATION,
  getActiveEditorFilePath,
  type AbsolutePath,
} from "@total-typescript/shared";
import { FSWatcher, watch } from "chokidar";
import { cpSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import fm from "front-matter";
import { err, ok, safeTry } from "neverthrow";

const CODE_HIKE_SRC = path.join(
  import.meta.dirname,
  "..",
  "..",
  "remotion-code-hike",
  "src"
) as AbsolutePath;

const CODE_HIKE_CONTENT_LOCATION = path.join(
  CODE_HIKE_SRC,
  "content.local.md"
) as AbsolutePath;

const CODE_HIKE_AUDIO_LOCATION = path.join(
  CODE_HIKE_SRC,
  "narration.local.mkv"
) as AbsolutePath;

const CODE_HIKE_META_LOCATION = path.join(
  CODE_HIKE_SRC,
  "meta.local.json"
) as AbsolutePath;

const vscodeWatcher = watch(SCRIPTKIT_VSCODE_LOCATION);

let fileWatcher: FSWatcher | null = null;

const closeWatcher = () => {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }
};

const getNarrationFilePath = (filePath: AbsolutePath) => {
  return filePath.replace(".md", ".narration.mkv") as AbsolutePath;
};

const getMetaFilePath = (filePath: AbsolutePath) => {
  return filePath.replace(".md", ".meta.json") as AbsolutePath;
};

const watchFile = (filePath: AbsolutePath) => {
  closeWatcher();

  fileWatcher = watch([
    filePath,
    getNarrationFilePath(filePath),
    getMetaFilePath(filePath),
  ]);

  fileWatcher.on("all", createFileUpdater(filePath));
};

const createFileUpdater = (filePath: AbsolutePath) => () => {
  const content = readFileSync(filePath, "utf-8");

  const frontMatter = (fm as any)(content);

  let durations: number[] = [];

  try {
    const meta = JSON.parse(readFileSync(getMetaFilePath(filePath), "utf-8"));

    durations = meta.durations;
  } catch (e) {}

  writeFileSync(CODE_HIKE_CONTENT_LOCATION, content);
  writeFileSync(
    CODE_HIKE_META_LOCATION,
    JSON.stringify(
      {
        ...frontMatter.attributes,
        durations,
      },
      null,
      2
    )
  );

  try {
    const narrationFilePath = getNarrationFilePath(filePath);
    cpSync(narrationFilePath, CODE_HIKE_AUDIO_LOCATION);
  } catch (e) {
    rmSync(CODE_HIKE_AUDIO_LOCATION, { force: true });
  }

  console.log("File changed!");
};

const watchActiveFilePath = async () => {
  const result = await safeTry(async function* () {
    const activeEditorFilePath = yield* getActiveEditorFilePath().mapErr(
      () => "active-editor-file-path-failed" as const
    );
    if (!activeEditorFilePath.endsWith(".md")) {
      return err("not-markdown-file" as const);
    }

    if (activeEditorFilePath === CODE_HIKE_CONTENT_LOCATION) {
      return ok(void 0);
    }

    const watchedFiles = Object.entries(
      fileWatcher?.getWatched() || {}
    ).flatMap(([dir, paths]) => {
      return paths.map((p) => path.join(dir, p));
    });

    if (watchedFiles.includes(activeEditorFilePath)) {
      return err("already-watching" as const);
    }

    console.log("Watching", activeEditorFilePath);

    watchFile(activeEditorFilePath);

    return ok(void 0);
  });

  if (result.isErr()) {
    switch (result.error) {
      case "not-markdown-file":
        console.log("Not a markdown file");
        break;
      case "already-watching":
        console.log("Already watching this file");
        break;
      case "active-editor-file-path-failed":
        console.log("Could not get active editor file path");
        break;
      default:
        result.error satisfies never;
    }
  }
};

await watchActiveFilePath();

vscodeWatcher.on("change", watchActiveFilePath);

console.log("Watching...");
