import type { Exercise } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

export const moveElementBack = <T extends { id: string }>(
  arr: T[],
  id: string
): T[] => {
  const index = arr.findIndex((el) => el.id === id);
  if (index === 0) return arr;
  const newArr = [...arr];
  newArr.splice(index - 1, 0, newArr.splice(index, 1)[0]!);
  return newArr;
};

export const moveElementForward = <T extends { id: string }>(
  arr: T[],
  id: string
): T[] => {
  const index = arr.findIndex((el) => el.id === id);
  if (index === arr.length - 1) return arr;
  const newArr = [...arr];
  newArr.splice(index + 1, 0, newArr.splice(index, 1)[0]!);
  return newArr;
};

export const sanitizeForVSCodeFilename = (str: string) => {
  return (
    str
      .replace(/'/g, "")
      // replace punctuation with spaces
      .replace(/[\'\?.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase()
  );
};

export const getStatusFromExercise = (exercise: {
  learningGoal: Exercise["learningGoal"];
  readyForRecording: Exercise["readyForRecording"];
}) => {
  if (!exercise.learningGoal) {
    return "needs-learning-goal";
  }

  if (exercise.readyForRecording) {
    return "ready-for-recording";
  }

  return "needs-content";
};

export const getHumanReadableStatusFromExercise = (exercise: {
  learningGoal: Exercise["learningGoal"];
  readyForRecording: Exercise["readyForRecording"];
}) => {
  const status = getStatusFromExercise(exercise);

  switch (status) {
    case "needs-learning-goal":
      return { value: "needs-learning-goal", label: "Learning Goal" };
    case "ready-for-recording":
      return { value: "ready-for-recording", label: "Recordable" };
    case "needs-content":
      return { value: "needs-content", label: "Content" };
  }
};

export const formDataToJson = async (request: Request): Promise<any> => {
  const formData = await request.formData();
  const json = {};

  for (const [key, value] of formData.entries()) {
    (json as any)[key] = value;
  }

  return json;
};

export const createJsonLoader = <T>(
  trpcFn: (args: LoaderFunctionArgs) => Promise<T>
) => trpcFn;

export const createFormDataAction =
  <T>(trpcFn: (json: any, args: ActionFunctionArgs) => Promise<T>) =>
  async (args: ActionFunctionArgs) => {
    const json = await formDataToJson(args.request);
    return trpcFn(json, args);
  };

export const createJsonAction =
  <T>(trpcFn: (json: any, args: ActionFunctionArgs) => Promise<T>) =>
  async (args: ActionFunctionArgs) => {
    const json = await args.request.json();
    return trpcFn(json, args);
  };
