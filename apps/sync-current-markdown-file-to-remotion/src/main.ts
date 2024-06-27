import {
  SCRIPTKIT_VSCODE_LOCATION,
  getActiveEditorFilePath,
  type AbsolutePath,
} from "@total-typescript/shared";
import { FSWatcher, watch } from "chokidar";
import { cpSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import fm from "front-matter";

const CODE_HIKE_SRC = path.join(
  import.meta.dirname,
  "..",
  "..",
  "remotion-code-hike",
  "src",
) as AbsolutePath;

const CODE_HIKE_PUBLIC = path.join(
  import.meta.dirname,
  "..",
  "..",
  "remotion-code-hike",
  "public",
) as AbsolutePath;

const CODE_HIKE_CONTENT_LOCATION = path.join(
  CODE_HIKE_SRC,
  "content.local.md",
) as AbsolutePath;

const CODE_HIKE_AUDIO_LOCATION = path.join(
  CODE_HIKE_PUBLIC,
  "narration.local.ogg",
) as AbsolutePath;

const CODE_HIKE_META_LOCATION = path.join(
  CODE_HIKE_SRC,
  "meta.local.json",
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
  return filePath.replace(".md", ".narration.ogg") as AbsolutePath;
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
        width: frontMatter.attributes?.width,
        height: frontMatter.attributes?.height,
        durations,
      },
      null,
      2,
    ),
  );

  try {
    const narrationFilePath = getNarrationFilePath(filePath);
    cpSync(narrationFilePath, CODE_HIKE_AUDIO_LOCATION);
  } catch (e) {}

  console.log("File changed!");
};

const watchActiveFilePath = async () => {
  const activeEditorFilePath = await getActiveEditorFilePath();

  if (!activeEditorFilePath) {
    return;
  }

  if (!activeEditorFilePath.endsWith(".md")) {
    return;
  }

  if (activeEditorFilePath === CODE_HIKE_CONTENT_LOCATION) {
    return;
  }

  const watchedFiles = Object.entries(fileWatcher?.getWatched() || {}).flatMap(
    ([dir, paths]) => {
      return paths.map((p) => path.join(dir, p));
    },
  );

  if (watchedFiles.includes(activeEditorFilePath)) {
    return;
  }

  console.log("Watching", activeEditorFilePath);

  watchFile(activeEditorFilePath);
};

await watchActiveFilePath();

vscodeWatcher.on("change", watchActiveFilePath);

console.log("Watching...");
