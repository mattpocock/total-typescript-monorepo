import { generateText } from "ai";
import { z } from "zod";
import { p } from "~/db";
import { model } from "~/model";
import { getLearningGoal } from "~/prompts";
import { createFormDataAction } from "~/utils";

const schema = z.object({
  courseTitle: z.string(),
  sectionTitle: z.string(),
  title: z.string(),
});

export const action = createFormDataAction(async (json) => {
  const { courseTitle, sectionTitle, title } = schema.parse(json);

  const exercises = await p.exercise.findMany({
    where: {
      learningGoal: {
        not: "",
      },
      title: {
        not: "",
      },
      AND: {
        title: {
          not: title.trim(),
        },
      },
      deleted: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 10,
    select: {
      title: true,
      learningGoal: true,
      section: {
        select: {
          title: true,
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  const result = await getLearningGoal({
    title,
    courseTitle,
    sectionTitle,
    exercises,
  });

  return result;
});
