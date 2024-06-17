import {
  SCRIPTKIT_VSCODE_LOCATION,
  getActiveEditorFilePath,
  type AbsolutePath,
} from "@total-typescript/shared";
import { FSWatcher, watch } from "chokidar";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import fm from "front-matter";

const CODE_HIKE_SRC = path.join(
  import.meta.dirname,
  "..",
  "..",
  "remotion-code-hike",
  "src",
) as AbsolutePath;

const CODE_HIKE_CONTENT_LOCATION = path.join(
  CODE_HIKE_SRC,
  "content.local.md",
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

const watchFile = (filePath: AbsolutePath) => {
  closeWatcher();

  fileWatcher = watch(filePath, {
    ignoreInitial: true,
  });

  fileWatcher.on("change", updateFile);
};

const updateFile = (filePath: AbsolutePath) => {
  const content = readFileSync(filePath, "utf-8");

  const frontMatter = (fm as any)(content);

  writeFileSync(CODE_HIKE_CONTENT_LOCATION, content);
  writeFileSync(
    CODE_HIKE_META_LOCATION,
    JSON.stringify(
      {
        width: frontMatter.attributes?.width,
        height: frontMatter.attributes?.height,
      },
      null,
      2,
    ),
  );

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
