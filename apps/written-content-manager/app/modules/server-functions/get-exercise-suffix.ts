const SUFFIXES_TO_SEARCH = [".problem", ".solution", ".explainer"];

export const getExerciseSuffix = (path: string): string | undefined => {
  for (const suffix of SUFFIXES_TO_SEARCH) {
    const index = path.indexOf(suffix);

    if (index === -1) continue;

    return path.slice(index + 1);
  }

  return undefined;
};
