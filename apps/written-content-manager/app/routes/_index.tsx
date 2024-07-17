import { useLoaderData } from "@remix-run/react";
import type {
  AbsolutePath,
  AnyPath,
  RelativePath,
} from "@total-typescript/shared";
import { readFile } from "fs/promises";
import path from "path";

const DIRS_TO_INCLUDE = ["noteworthy-topic", "scratch"];

const fileWithExtensionRegex = /\.[a-z]{1,}$/;

const isDir = (file: string) => {
  return !fileWithExtensionRegex.test(file);
};

type FileGroup = {
  base: string;
  name: string;
  files: {
    path: AbsolutePath;
    name: string;
  }[];
};

const groupFiles = async (
  basePath: AbsolutePath,
  files: AbsolutePath[],
): Promise<FileGroup[]> => {
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
    } else {
      fileMap.set(id, {
        base,
        name,
        files: [file],
      });
    }
  }

  return Array.from(fileMap.values());
};

const filterOutBadFiles = (files: AbsolutePath[]) => {
  return files.filter((file) => {
    if (file.endsWith(".DS_Store")) return false;

    if (isDir(file)) return false;

    return true;
  });
};

export const loader = async () => {
  const path = await import("path");
  const fs = await import("fs/promises");
  const WRITTEN_CONTENT_BASE = path.join(
    import.meta.dirname,
    "../../../",
    "written-content",
  ) as AbsolutePath;

  const allFiles: AbsolutePath[] = [];

  for (const dir of DIRS_TO_INCLUDE) {
    const dirPath = path.join(WRITTEN_CONTENT_BASE, dir);
    const files = await fs.readdir(dirPath, {
      recursive: true,
    });
    for (const file of files) {
      allFiles.push(path.join(WRITTEN_CONTENT_BASE, dir, file) as AbsolutePath);
    }
  }

  return {
    allFiles: await groupFiles(
      WRITTEN_CONTENT_BASE,
      filterOutBadFiles(allFiles),
    ),
  };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
