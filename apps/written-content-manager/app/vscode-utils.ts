import { type AbsolutePath } from "@total-typescript/shared";
import path from "path";
import { editExerciseUrl } from "./routes";
import { getFS } from "./fs";

export const PLAYGROUND_ROOT_PATH = path.join(
  import.meta.dirname,
  "..",
  "..",
  "exercise-playground",
  "src"
);

export const POST_PLAYGROUND_ROOT_PATH = path.join(
  PLAYGROUND_ROOT_PATH,
  "posts"
);

export const EXERCISE_PLAYGROUND_ROOT_PATH = path.join(
  PLAYGROUND_ROOT_PATH,
  "exercises"
);

export const getExerciseDir = (exerciseId: string) => {
  return path.join(EXERCISE_PLAYGROUND_ROOT_PATH, exerciseId) as AbsolutePath;
};

export const getPostsDir = (postId: string) => {
  return path.join(POST_PLAYGROUND_ROOT_PATH, postId) as AbsolutePath;
};

export const AUDIO_FILE_NAME = "audio.mkv";

export const getAudioPathForExercise = (exerciseId: string) => {
  return path.join(getExerciseDir(exerciseId), AUDIO_FILE_NAME) as AbsolutePath;
};

export const getDoesAudioExistForExercise = async (exerciseId: string) => {
  const fs = getFS();
  return fs.exists(getAudioPathForExercise(exerciseId)).then(
    () => true,
    () => false
  );
};

export const getVSCodeFilesForPost = async (postId: string) => {
  const postPath = getPostsDir(postId);

  const fs = getFS();

  const possiblePaths = ["**/**"];

  const files = await fs.glob(possiblePaths, {
    cwd: postPath,
    onlyFiles: true,
    absolute: true,
  });

  return files as AbsolutePath[];
};

export const getVSCodeFilesForExercise = async (exerciseId: string) => {
  const exercisePath = getExerciseDir(exerciseId);

  const fs = getFS();

  const possiblePaths = [
    "**/*.problem.*{ts,tsx}",
    "**/*.solution.*{ts,tsx}",
    "**/*.explainer.*{ts,tsx}",
  ];

  const files = await fs.glob(possiblePaths, {
    cwd: exercisePath,
    onlyFiles: true,
    absolute: true,
  });

  return files as AbsolutePath[];
};

export const modifyLinkingComment = (
  fileContents: string,
  newExerciseId: string
) => {
  const lines = fileContents.split("\n");

  if (lines[0]?.startsWith("// http://localhost:3004")) {
    lines[0] = `// http://localhost:3004${editExerciseUrl(newExerciseId)}`;
  }

  return lines.join("\n");
};
