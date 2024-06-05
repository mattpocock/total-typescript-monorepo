import { execSync } from "child_process";
import "colors";
import { readFileSync, writeFileSync } from "fs";
import { stat } from "fs/promises";
import * as path from "path";
import { cleanVitestOutput } from "./cleanVitestOutput.js";
import { isDir } from "./detectExerciseType.js";
import { findAllExercises } from "./findAllExercises.js";
import { npx } from "./install.js";

type Snapshot = {
  title: string;
  content: string;
};

const getTSSnapshotFromFolder = (folder: string): string => {
  let result: string;
  try {
    result = npx(`tsc`, {
      cwd: folder,
    }).toString();
  } catch (error: any) {
    result = error.output.toString();
  }
  return result;
};

const getTSSnapshotFromFolderExercises = async (
  rootFolder: string,
): Promise<string> => {
  const srcPath = path.resolve(rootFolder, "./src");
  const exercises = await findAllExercises(srcPath, {
    allowedTypes: ["problem", "explainer", "solution"],
  });

  const exercisesWhichAreFolders = [];

  for (const filePath of exercises) {
    if (await isDir(filePath)) {
      try {
        const tsconfigPath = path.resolve(filePath, "tsconfig.json");

        if (await stat(tsconfigPath)) {
          exercisesWhichAreFolders.push(filePath);
        }
      } catch (e) {}
    }
  }

  let snapshots: Snapshot[] = [];

  for (const exerciseFolder of exercisesWhichAreFolders) {
    console.log("Checking " + exerciseFolder);

    const tsSnapshot = getTSSnapshotFromFolder(exerciseFolder);

    snapshots.push({
      title: exerciseFolder,
      content: tsSnapshot,
    });
  }

  return snapshots.reduce((acc, snapshot) => {
    return [
      acc,
      "",
      `# [](${path.relative(
        rootFolder,
        path.join(snapshot.title, "tsconfig.json"),
      )})`,
      "",
      "```txt",
      snapshot.content,
      "```",
    ].join("\n");
  }, "");
};

const getTSSnapshot = async (rootFolder: string): Promise<string> => {
  const rootTSSnapshot = getTSSnapshotFromFolder(rootFolder);

  const tsSnapshotFromFolderExercises =
    await getTSSnapshotFromFolderExercises(rootFolder);

  return [
    `# Root TSConfig Snapshot`,
    "",
    "```txt",
    rootTSSnapshot,
    "```",
    "",
    tsSnapshotFromFolderExercises,
  ].join("\n");
};

const getVitestSnapshot = (rootFolder: string): string => {
  let result: string;

  try {
    result = npx(`vitest run --reporter=json`, {
      cwd: rootFolder,
      stdio: "pipe",
    }).toString();
  } catch (error: any) {
    result = error.output.toString();
  }

  const vitestOutput = cleanVitestOutput(result, {
    rootFolder,
  });

  return [
    `# Vitest Snapshot`,
    "",
    "```json",
    JSON.stringify(vitestOutput, null, 2),
    "```",
  ].join("\n");
};

const getSnapshot = async () => {
  const tsSnapshot = await getTSSnapshot(process.cwd());

  const vitestSnapshot = getVitestSnapshot(process.cwd());

  const fullSnapshot = tsSnapshot + "\n\n" + vitestSnapshot;

  return fullSnapshot;
};

export const takeSnapshot = async (outPath: string) => {
  const fullSnapshot = await getSnapshot();
  writeFileSync(outPath, fullSnapshot);
};

export const compareSnapshotAgainstExisting = async (outPath: string) => {
  const newSnapshot = await getSnapshot();
  const existingSnapshot = readFileSync(outPath, "utf8");

  if (newSnapshot !== existingSnapshot) {
    execSync(`git add ${outPath}`, { stdio: "inherit" });

    writeFileSync(outPath, newSnapshot);

    console.log("Snapshots differ. Showing diff:");

    execSync(`git --no-pager diff ${outPath}`, { stdio: "inherit" });
    process.exit(1);
  }
};
