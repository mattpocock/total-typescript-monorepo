import { Command } from "commander";
import { runExercise } from "./runExercise.js";
import { prepareStackblitz } from "./prepareStackblitz.js";
import {
  compareSnapshotAgainstExisting,
  takeSnapshot,
} from "./snapshotExercises.js";
import { upgrade } from "./upgrade.js";
import { runPrompts } from "./runPrompts.js";

export const program = new Command();

program.version("0.3.3");

program
  .command("run [exercise]")
  .alias("exercise [exercise]")
  .description("Runs an exercise on watch mode")
  .option("-s, --solution", "Run the solution")
  .action(
    (
      exercise: string,
      options: {
        solution: boolean;
      },
    ) => {
      if (exercise) {
        runExercise(exercise, options.solution);
      } else {
        runPrompts();
      }
    },
  );

program
  .command("prepare-stackblitz")
  .description("Adds e-01, e-02 scripts to package.json")
  .action(prepareStackblitz);

program
  .command("take-snapshot <snapshotPath>")
  .description("Takes a snapshot of the current state of the exercises")
  .action(takeSnapshot);

program
  .command("compare-snapshot <snapshotPath>")
  .description("Compares the current state of the exercises against a snapshot")
  .action(compareSnapshotAgainstExisting);

program
  .command("upgrade")
  .description(
    "Upgrades TypeScript, Vitest and the TT CLI to the latest version, with snapshot tests.",
  )
  .action(() => upgrade("latest"));

program
  .command("upgrade-beta")
  .description(
    "Upgrades TypeScript to the beta version, Vitest and the TT CLI to the latest versions, with snapshot tests.",
  )
  .action(() => upgrade("beta"));
