import { useLoaderData } from "@remix-run/react";
import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { useMemo, useState } from "react";
import { groupFiles } from "~/groupFiles";
import { isDir } from "~/isDir";
import Fuse from "fuse.js";

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

export const loader = async () => {
  const path = await import("path");
  const fs = await import("fs/promises");
  const WRITTEN_CONTENT_BASE = path.join(
    import.meta.dirname,
    "../../../",
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

  return {
    allFiles: groupedFiles,
  };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  const [search, setSearch] = useState("");

  const fuse = useMemo(() => {
    return new Fuse(data.allFiles, {
      keys: ["name", "base", "tags"],
    });
  }, [data.allFiles]);

  const searchResults = useMemo(() => {
    if (!search) return data.allFiles;

    return fuse.search(search).map((result) => result.item);
  }, [search, fuse]);

  return (
    <div className="p-6 grid gap-4">
      <label className="w-full block space-y-2">
        <span className="block text-xl">Search</span>
        <input
          className="bg-gray-100 p-2 w-full"
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          value={search}
        ></input>
      </label>
      {searchResults.map((group) => {
        return (
          <div className="space-y-2">
            <h2 className="text-xl">{group.name}</h2>
            <div className="flex items-center gap-3">
              <h3 className="text-xs bg-gray-200 inline-block px-3 py-1 rounded uppercase text-gray-700">
                {group.base}
              </h3>
              {group.tags.map((tag) => (
                <h3
                  className="text-xs bg-gray-200 inline-block px-3 py-1 rounded uppercase text-gray-700"
                  key={tag}
                >
                  {tag}
                </h3>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
