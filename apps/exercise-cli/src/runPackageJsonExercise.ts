import { execSync } from "child_process";

export const runPackageJsonExercise = async (exerciseFile: string) => {
  // Install the packages with pnpm
  execSync("pnpm install", {
    cwd: exerciseFile,
    stdio: "inherit",
  });

  // Run the dev script of the package.json

  execSync("pnpm run dev", {
    cwd: exerciseFile,
    stdio: "inherit",
  });
};
