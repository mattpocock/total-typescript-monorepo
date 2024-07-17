import type { AbsolutePath } from "@total-typescript/shared";
import path from "path";
import { isDir } from "./isDir";

type FileGroup = {
  base: string;
  name: string;
  files: {
    path: AbsolutePath;
    name: string;
  }[];
  tags: string[];
};

export const groupFiles = ({
  basePath,
  files,
  getTags,
}: {
  basePath: AbsolutePath;
  files: AbsolutePath[];
  getTags: (files: AbsolutePath[]) => string[];
}): FileGroup[] => {
  const fileMap = new Map<string, FileGroup>();

  for (const filePath of files) {
    const [base, name, ...rest] = path.relative(basePath, filePath).split("/");

    if (!base || !name) continue;

    if (!isDir(name)) continue;

    const id = base + "/" + name;

    const group = fileMap.get(id);

    const file = {
      path: filePath,
      name: rest.join("/"),
    };

    if (group) {
      group.files.push(file);
      group.tags = getTags(group.files.map((f) => f.path));
    } else {
      fileMap.set(id, {
        base,
        name,
        files: [file],
        tags: getTags([filePath]),
      });
    }
  }

  return Array.from(fileMap.values());
};
