import { useLoaderData } from "@remix-run/react";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { loadFilesFromWrittenContent } from "~/loadFilesFromWrittenContent";

export const loader = async () => {
  return {
    allFiles: await loadFilesFromWrittenContent(),
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
