import { useFetcher } from "@remix-run/react";
import { viewExerciseInVSCodeUrl } from "./routes";

export const useOpenInVSCode = () => {
  const openInVSCodeFetcher = useFetcher();

  return (exerciseId: string) => {
    openInVSCodeFetcher.submit(
      {},
      {
        action: viewExerciseInVSCodeUrl(exerciseId),
        method: "POST",
        preventScrollReset: true,
      }
    );
  };
};
