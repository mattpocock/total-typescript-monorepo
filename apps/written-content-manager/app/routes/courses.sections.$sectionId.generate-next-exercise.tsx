import type { ActionFunctionArgs } from "@remix-run/node";
import { p } from "~/db";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { getLearningGoal, getNextExerciseTitle } from "~/prompts";
import { createFormDataAction } from "~/utils";

export const action = async (args: ActionFunctionArgs) => {
  const { sectionId } = args.params;

  const section = await p.section.findUniqueOrThrow({
    where: {
      id: sectionId,
    },
    select: {
      course: {
        select: {
          title: true,
        },
      },
      title: true,
      exercises: {
        where: {
          deleted: false,
        },
        orderBy: {
          order: "asc",
        },
        select: {
          title: true,
          learningGoal: true,
        },
      },
    },
  });

  const result = await getNextExerciseTitle({
    courseTitle: section.course.title,
    sectionTitle: section.title,
    exercises: section.exercises,
  });

  const { learningGoal } = await getLearningGoal({
    courseTitle: section.course.title,
    sectionTitle: section.title,
    title: result.title,
  });

  await serverFunctions.exercises.create({
    sectionId: sectionId!,
    title: result.title,
    learningGoal,
  });

  return null;
};
