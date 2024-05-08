import { execSync } from "child_process";
import * as chokidar from "chokidar";
import * as fs from "fs/promises";
import { parse as jsonCParse } from "jsonc-parser";
import * as path from "path";

/**
 * Runs exercises that are based on a single file,
 * like 01-whatever.problem.ts
 */
export const runFileBasedExercise = async (exerciseFile: string) => {
  const tempTsconfigPath = path.resolve(process.cwd(), "./tsconfig.temp.json");

  const tsconfigPath = path.resolve(process.cwd(), "./tsconfig.json");
  const tsconfig = jsonCParse(await fs.readFile(tsconfigPath, "utf8"));

  chokidar.watch(exerciseFile).on("all", async () => {
    const fileContents = await fs.readFile(exerciseFile, "utf8");

    const containsVitest =
      fileContents.includes(`from "vitest"`) ||
      fileContents.includes(`from 'vitest'`);
    try {
      console.clear();
      if (containsVitest) {
        console.log("Running tests...");
        execSync(`vitest run "${exerciseFile}" --passWithNoTests`, {
          stdio: "inherit",
        });
      }
      console.log("Checking types...");

      // Write a temp tsconfig.json
      const tsconfigWithIncludes = {
        ...tsconfig,
        include: [exerciseFile],
      };

      await fs.writeFile(
        tempTsconfigPath,
        JSON.stringify(tsconfigWithIncludes, null, 2),
      );

      execSync(`tsc --project "${tempTsconfigPath}"`, {
        stdio: "inherit",
      });
      console.log("Typecheck complete. You finished the exercise!");
    } catch (e) {
      console.log("Failed. Try again!");

      try {
        await fs.rm(tempTsconfigPath);
      } catch (e) {}
    }
  });
};
