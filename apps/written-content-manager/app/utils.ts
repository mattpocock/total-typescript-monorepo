import type { Exercise } from "@prisma/client";

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

export const createVSCodeFilename = (str: string) => {
  return (
    str
      // replace punctuation with spaces
      .replace(/[\?.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
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
      return { value: "needs-learning-goal", label: "Needs Learning Goal" };
    case "ready-for-recording":
      return { value: "ready-for-recording", label: "Ready for Recording" };
    case "needs-content":
      return { value: "needs-content", label: "Needs Content" };
  }
};
