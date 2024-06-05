import { detectExerciseType } from "./detectExerciseType.js";
import { findExerciseInCwd } from "./findAllExercises.js";
import { runFileBasedExercise } from "./runFileBasedExercise.js";
import { runPackageJsonExercise } from "./runPackageJsonExercise.js";

export const runExercise = async (exercise: string, runSolution: boolean) => {
  if (!exercise) {
    console.log("Please specify an exercise");
    process.exit(1);
  }

  const exerciseFile = await findExerciseInCwd(exercise, runSolution);

  await runExerciseFile(exerciseFile);
};

export const runExerciseFile = async (exercisePath: string) => {
  const exerciseType = await detectExerciseType(exercisePath);

  if (exerciseType === "not-runnable") {
    console.log(`Not all exercises in this repo are runnable.`);
    console.log(
      `This is intentional - some of the files in the repo are to help the instructor explain things.`,
    );
    console.log(`Try running a different exercise!`);
    process.exit(0);
  }

  switch (exerciseType) {
    case "file":
      return await runFileBasedExercise(exercisePath);

    case "package-json-with-dev-script":
      return await runPackageJsonExercise(exercisePath);
  }
  exerciseType satisfies never;
};
