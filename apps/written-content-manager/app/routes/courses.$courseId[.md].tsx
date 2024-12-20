import type { LoaderFunctionArgs } from "@remix-run/node";
import { p } from "~/db";

// Returns a markdown readout of the course and all its exercises
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { courseId } = params;

  const course = await p.course.findUniqueOrThrow({
    where: {
      id: courseId,
    },
    select: {
      title: true,
      sections: {
        where: {
          deleted: false,
        },
        select: {
          title: true,
          exercises: {
            where: {
              deleted: false,
            },
            select: {
              title: true,
              learningGoal: true,
              notes: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return new Response(
    [
      `# ${course.title}`,
      ...course.sections.map((section, sectionIndex) => {
        return [
          `## ${sectionIndex + 1}: ${section.title}`,
          ...section.exercises.map((exercise, exerciseIndex) => {
            return [
              `### ${sectionIndex + 1}.${exerciseIndex + 1}: ${exercise.title}`,
              exercise.learningGoal,
              exercise.notes,
            ]
              .join("\n\n")
              .trim();
          }),
        ].join("\n\n");
      }),
    ].join("\n\n"),
    {
      headers: {
        "Content-Type": "text/markdown",
      },
    }
  );
};
