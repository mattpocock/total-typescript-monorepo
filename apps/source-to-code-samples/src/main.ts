import { type AbsolutePath } from "@total-typescript/shared";
import { watch } from "chokidar";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const writtenContentPaths = path.resolve(
  import.meta.dirname,
  "../../exercise-playground",
  "**/**.source.{ts,tsx}"
);

const watcher = watch(writtenContentPaths, {
  ignored: ["**/node_modules/**", "**/.git/**"],
});

watcher.on("change", (_filePath) => {
  const filePath = _filePath as AbsolutePath;

  console.log(filePath);

  const sourceContent = readFileSync(filePath, "utf-8");

  /**
   * If source file is empty, don't add
   */
  if (sourceContent.trim().length === 0) {
    return;
  }

  const isTsx = filePath.endsWith(".tsx");

  const targetFilePath = filePath
    .replace(".source.tsx", ".md")
    .replace(".source.ts", ".md");

  let targetContent = "";

  try {
    targetContent = readFileSync(targetFilePath, "utf-8");
  } catch (e) {}

  writeFileSync(
    targetFilePath,
    [
      targetContent.trim(),
      "",
      "```" + (isTsx ? "tsx" : "ts") + " !!",
      sourceContent.trim(),
      "```",
      "",
    ]
      .join("\n")
      .trim() + "\n"
  );
});
