import * as fg from "fast-glob";
import path from "path";

const searchToGlob = (search: {
  num?: string;
  allowedTypes?: ("explainer" | "solution" | "problem")[];
}) => {
  return `**/${search?.num ?? ""}*.{${search?.allowedTypes?.join(",") ?? ""}}*`;
};

export const findExerciseInCwd = async (
  exercise: string,
  runSolution: boolean,
): Promise<string> => {
  const srcPath = path.resolve(process.cwd(), "./src");

  const exerciseFile = await findExercise(srcPath, {
    num: exercise,
    allowedTypes: ["explainer", runSolution ? "solution" : "problem"],
  });

  if (!exerciseFile) {
    console.log(`Exercise ${exercise} not found`);
    process.exit(1);
  }

  return exerciseFile;
};

export const findAllExercises = async (
  srcPath: string,
  search: {
    num?: string;
    allowedTypes: ("explainer" | "solution" | "problem")[];
  },
): Promise<string[]> => {
  const glob = searchToGlob(search || {});

  const allExercises = await fg.default(
    path.join(srcPath, "**", glob).replace(/\\/g, "/"),
    {
      onlyFiles: false,
    },
  );

  return allExercises.sort((a, b) => a.localeCompare(b));
};

export const findExercise = async (
  srcPath: string,
  search: {
    num?: string;
    allowedTypes?: ("explainer" | "solution" | "problem")[];
  },
): Promise<string | undefined> => {
  const glob = searchToGlob(search);

  const allExercises = await fg.default(
    path.join(srcPath, "**", glob).replace(/\\/g, "/"),
    {
      onlyFiles: false,
    },
  );

  return allExercises[0];
};
