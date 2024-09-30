import { useFetcher } from "@remix-run/react";
import {
  copyPreviousExerciseFilesUrl,
  createExerciseExplainerUrl,
  createExerciseProblemSolutionUrl,
  openPostInVSCodeUrl,
  viewExerciseInVSCodeUrl,
} from "./routes";

export const useVSCode = () => {
  const vsCodeFetcher = useFetcher();

  const submit = (url: string) => {
    vsCodeFetcher.submit(
      {},
      {
        action: url,
        method: "POST",
        preventScrollReset: true,
      }
    );
  };

  return {
    openExercise: (exerciseId: string) => {
      submit(viewExerciseInVSCodeUrl(exerciseId));
    },
    openSocialPostPlayground: (postId: string) => {
      submit(openPostInVSCodeUrl(postId));
    },
    copyPreviousExerciseFiles: (exerciseId: string) => {
      submit(copyPreviousExerciseFilesUrl(exerciseId));
    },
    createExplainer: (exerciseId: string) => {
      submit(createExerciseExplainerUrl(exerciseId));
    },
    createProblemSolution: (exerciseId: string) => {
      submit(createExerciseProblemSolutionUrl(exerciseId));
    },
  };
};
