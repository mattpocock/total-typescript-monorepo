import { generateText } from "ai";
import { p } from "./db";
import { model } from "./model";
import { z } from "zod";

export const getLearningGoal = async ({
  title,
  courseTitle,
  sectionTitle,
  exercises,
}: {
  title: string;
  courseTitle: string;
  sectionTitle: string;
  exercises: {
    title: string;
    learningGoal: string | null;
    section: {
      title: string;
      course: {
        title: string;
      };
    };
  }[];
}) => {
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
