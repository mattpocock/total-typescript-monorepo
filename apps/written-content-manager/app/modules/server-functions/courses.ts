import { z } from "zod";
import { createServerFunction } from "./utils";
import { printCourseToRepo } from "./print-course-to-repo";

export const courses = {
  create: createServerFunction(
    z.object({
      title: z.string(),
      type: z.enum(["WORKSHOP", "TUTORIAL"]).optional().default("WORKSHOP"),
      repoSlug: z.string().optional(),
    }),
    async ({ input, p }) => {
      return p.course.create({
        data: {
          title: input.title,
          type: input.type,
          repoSlug: input.repoSlug,
        },
      });
    }
  ),
  delete: createServerFunction(
    z.object({ id: z.string().uuid() }),
    async ({ input, p }) => {
      return p.course.update({
        data: {
          deleted: true,
        },
        where: {
          id: input.id,
        },
      });
    }
  ),
  update: createServerFunction(
    z.object({
      id: z.string().uuid(),
      title: z.string().optional(),
      type: z.enum(["WORKSHOP", "TUTORIAL"]).optional(),
      repoSlug: z.string().optional(),
    }),
    async ({ input, p }) => {
      return p.course.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          type: input.type,
          repoSlug: input.repoSlug,
        },
      });
    }
  ),
  list: createServerFunction(z.object({}), async ({ input, p }) => {
    const courses = await p.course.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      where: {
        deleted: false,
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
          repoSlug: true,
          deleted: true,
          type: true,
          lastPrintedToRepoAt: true,
          sections: {
            where: {
              deleted: false,
            },
            select: {
              id: true,
              title: true,
              order: true,
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
  printToRepo: printCourseToRepo,
};
