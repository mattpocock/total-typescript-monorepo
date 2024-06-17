import {
  SCRIPTKIT_VSCODE_LOCATION,
  getActiveEditorFilePath,
  type AbsolutePath,
} from "@total-typescript/shared";
import { FSWatcher, watch } from "chokidar";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const CODE_HIKE_CONTENT_LOCATION = path.join(
  import.meta.dirname,
  "..",
  "..",
  "remotion-code-hike",
  "src",
  "content.md",
) as AbsolutePath;

const vscodeWatcher = watch(SCRIPTKIT_VSCODE_LOCATION);

let fileWatcher: FSWatcher | null = null;

const closeWatcher = () => {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }
};

const watchFile = (filePath: AbsolutePath) => {
  closeWatcher();

  fileWatcher = watch(filePath, {
    ignoreInitial: true,
  });

  fileWatcher.on("change", updateFile);
};

const updateFile = (filePath: AbsolutePath) => {
  const content = readFileSync(filePath, "utf-8");

  writeFileSync(CODE_HIKE_CONTENT_LOCATION, content);

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
