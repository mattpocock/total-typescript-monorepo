import { generateText } from "ai";
import { p } from "./db";
import { model } from "./model";
import { z } from "zod";

export const getLearningGoal = async ({
  title,
  courseTitle,
  sectionTitle,
}: {
  title: string;
  courseTitle: string;
  sectionTitle: string;
}) => {
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

  const system = `You are an assistant writing learning goals.

  Given a title of an exercise, including the section and
  course it belongs to, you will write a goal for the exercise.

  Here are some previous examples:

  <examples>
  ${exercises
    .map((exercise) => {
      return `
    <example>
      <course-title>${exercise.section.course.title}</course-title>
      <section-title>${exercise.section.title}</section-title>
      <exercise-title>${exercise.title}</exercise-title>
      <goal>${exercise.learningGoal}</goal>
    </example>
    `;
    })
    .join("\n")}
  </examples>
  `;

  const result = await generateText({
    model: model,
    system,
    toolChoice: "required",
    tools: {
      answer: {
        parameters: z.object({
          learningGoal: z
            .string()
            .describe("The learning goal for the exercise."),
        }),
        description: "The tool used to answer the prompt.",
      },
    },
    prompt: `
    <course-title>${courseTitle}</course-title>
    <section-title>${sectionTitle}</section-title>
    <exercise-title>${title}</exercise-title>
    `,
  });

  const learningGoal = result.toolCalls[0]?.args.learningGoal;

  if (!learningGoal) {
    throw new Response("No learning goal generated.", {
      status: 500,
    });
  }

  return {
    learningGoal,
  };
};

export const getNextExerciseTitle = async ({
  courseTitle,
  sectionTitle,
  exercises,
}: {
  sectionTitle: string;
  courseTitle: string;
  exercises: {
    title: string;
    learningGoal: string | null;
  }[];
}) => {
  const system = `You are an assistant writing a course curriculum.

  Given a section title and course title, you will write the next
  exercise title.

  Each exercise topic should be small enough to digest in 5 minutes.
  `;

  const result = await generateText({
    model: model,
    system,
    toolChoice: "required",
    tools: {
      answer: {
        parameters: z.object({
          title: z.string().describe("The title of the next exercise."),
        }),
        description: "The tool used to answer the prompt.",
      },
    },
    prompt: `
    <course-title>${courseTitle}</course-title>
    <section-title>${sectionTitle}</section-title>
    <exercises>
    ${exercises
      .map((exercise) => {
        return `
      <exercise>
        <title>${exercise.title}</title>
        <goal>${exercise.learningGoal}</goal>
      </exercise>
      `;
      })
      .join("\n")}
    </exercises>
    `,
  });

  const title = result.toolCalls[0]?.args.title;

  if (!title) {
    throw new Response("No title.", {
      status: 500,
    });
  }

  return {
    title,
  };
};
