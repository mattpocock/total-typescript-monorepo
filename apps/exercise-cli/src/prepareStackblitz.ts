import * as fs from "fs/promises";
import * as path from "path";
import { findAllExercises } from "./findAllExercises.js";

/**
 * Adds a bunch of scripts, like e-01, e-02 to package.json
 * so that StackBlitz can run them programmatically via URL
 * commands
 */

export const prepareStackblitz = async () => {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));

  const srcPath = path.resolve(process.cwd(), "./src");
  const exerciseFiles = await findAllExercises(srcPath, {
    allowedTypes: ["problem", "explainer"],
  });
  const exerciseNames = exerciseFiles.map(
    (exercise) => path.parse(exercise).base.split("-")[0],
  );

  const newPackageJson = Object.assign({}, packageJson);

  newPackageJson.scripts = {
    ...packageJson.scripts,
  };

  exerciseNames.forEach((exercise) => {
    newPackageJson.scripts[`e-${exercise}`] = `tt-cli run ${exercise}`;
    newPackageJson.scripts[`s-${exercise}`] =
      `tt-cli run ${exercise} --solution`;
  });

  await fs.writeFile(packageJsonPath, JSON.stringify(newPackageJson, null, 2));
};
