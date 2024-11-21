import { createHash } from "crypto";
import { glob, mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";

const basePaths = [
  path.join("apps/exercise-playground/src"),
  path.join("apps/written-content"),
];

const outputFolder = "./output.local";

await rm(outputFolder, { recursive: true, force: true });
await mkdir(outputFolder);

const files = await glob(
  basePaths.map((p) => path.join(p, `**/*.{md,ts,tsx}`)),
  {
    exclude: (path) => path.includes("node_modules"),
  }
);

const NEWLINE_CHARACTER_REGEX = /\r\n|\r|\n/g;

for await (const file of files) {
  const fileContents = await readFile(file, "utf-8");

  // Count the number of newlines in the file
  const newlines = fileContents.match(NEWLINE_CHARACTER_REGEX);

  const newLinesCount = newlines?.length ?? 0;

  if (newLinesCount < 4) {
    continue;
  }

  const hash = createHash("sha256")
    .update(fileContents + file)
    .digest("hex")
    .slice(0, 8);

  const parsedPath = path.parse(file);

  const newFileName = `${parsedPath.name}-${hash}.md`;
  const newFilePath = path.join(outputFolder, newFileName);

  if (parsedPath.ext === ".md") {
    await writeFile(newFilePath, fileContents);
  } else {
    const newFileContents = [
      "```" + parsedPath.ext.slice(1),
      fileContents,
      "```",
    ].join("\n");

    await writeFile(newFilePath, newFileContents);
  }
}
