import prompts from "prompts";
import path from "path";
import { findAllExercises } from "./findAllExercises.js";
import { runExerciseFile } from "./runExercise.js";

export const runPrompts = async () => {
  const srcPath = path.resolve(process.cwd(), "./src");

  const exercises = await findAllExercises(srcPath, {
    allowedTypes: ["explainer", "problem", "solution"],
  });

  const { exercisePath }: { exercisePath: string | undefined } = await prompts({
    type: "autocomplete",
    message: "Select an exercise file to run (type to autocomplete)",
    name: "exercisePath",
    async suggest(input: string, choices) {
      return choices.filter((choice) => {
        return choice.title.toLowerCase().includes(input.toLowerCase());
      });
    },
    choices: exercises.map((exercise) => {
      const exerciseName = path.basename(exercise);

      return {
        title: exerciseName,
        value: exercise,
      };
    }),
  });

  if (!exercisePath) {
    process.exit(0);
  }

  await runExerciseFile(exercisePath);
};
