import type { MetaFunction } from "@remix-run/node";
import os from "os";
import { readdirSync } from "fs";
import path from "path";
import { RelativePath } from "@total-typescript/shared";
import { Link, useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async () => {
  const DESKTOP = path.join(os.homedir(), "Desktop");

  const files = (await readdirSync(DESKTOP)) as RelativePath[];

  return files
    .filter((file) => file.endsWith("mp4"))
    .map((file) => {
      return {
        relative: file,
        absolute: path.join(DESKTOP, file),
      };
    });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <ul>
        {data.map((file) => (
          <li key={file.relative}>
            <Link to={`/video/${encodeURIComponent(file.absolute)}`}>
              {file.relative}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
