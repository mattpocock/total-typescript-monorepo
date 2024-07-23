import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { isDir } from "./isDir";
import { groupFiles } from "./groupFiles";

const DIRS_TO_INCLUDE = ["noteworthy-topic", "scratch"];

const createGetTags =
  (ctx: { reactRelatedFiles: Set<AbsolutePath> }) =>
  (files: AbsolutePath[]) => {
    const tags: string[] = [];
    if (files.some((file) => ctx.reactRelatedFiles.has(file))) {
      tags.push("react");
    }

    return tags;
  };

const filterOutBadFiles = (files: AbsolutePath[]) => {
  return files.filter((file) => {
    if (file.endsWith(".DS_Store")) return false;

    if (isDir(file)) return false;

    return true;
  });
};

const getReactRelatedFiles = async (basePath: AbsolutePath) => {
  const grepResult = await execAsync(
    `grep -Rnwl '${basePath}' -e 'react' --exclude-dir=node_modules`,
  );

  return new Set(
    grepResult.stdout.trim().split("\n").filter(Boolean),
  ) as Set<AbsolutePath>;
};

export const loadFilesFromWrittenContent = async () => {
  const path = await import("path");
  const fs = await import("fs/promises");
  const WRITTEN_CONTENT_BASE = path.join(
    import.meta.dirname,
    "../../",
    "written-content",
  ) as AbsolutePath;

  const allFiles: AbsolutePath[] = [];

  const reactRelatedFiles = await getReactRelatedFiles(WRITTEN_CONTENT_BASE);

  for (const dir of DIRS_TO_INCLUDE) {
    const dirPath = path.join(WRITTEN_CONTENT_BASE, dir);
    const files = await fs.readdir(dirPath, {
      recursive: true,
    });
    for (const file of files) {
      allFiles.push(path.join(WRITTEN_CONTENT_BASE, dir, file) as AbsolutePath);
    }
  }

  const groupedFiles = groupFiles({
    basePath: WRITTEN_CONTENT_BASE,
    files: filterOutBadFiles(allFiles),
    getTags: createGetTags({ reactRelatedFiles }),
  });

  return groupedFiles;
};
