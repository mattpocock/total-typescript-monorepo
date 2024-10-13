import { z } from "zod";
import { createServerFunction } from "./utils";

export const courses = {
  list: createServerFunction(z.object({}), async ({ input, p }) => {
    const courses = await p.course.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    const exerciseCounts = await p.$transaction(
      courses.map((c) => {
        return p.exercise.count({
          where: {
            section: {
              courseId: c.id,
            },
            deleted: false,
          },
        });
      })
    );

    return courses.map((c, index) => ({
      ...c,
      exerciseCount: exerciseCounts[index]!,
    }));
  }),
  get: createServerFunction(
    z.object({ id: z.string().uuid() }),
    async ({ input, p }) => {
      return await p.course.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          title: true,
          sections: {
            where: {
              deleted: false,
            },
            select: {
              id: true,
              title: true,
              exercises: {
                where: {
                  deleted: false,
                },
                select: {
                  readyForRecording: true,
                  learningGoal: true,
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    }
  ),
};
