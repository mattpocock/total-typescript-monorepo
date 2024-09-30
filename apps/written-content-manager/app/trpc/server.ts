import { pathExists } from "@total-typescript/shared";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { p } from "~/db";

const t = initTRPC.create();
const publicProcedure = t.procedure;

export const appRouter = t.router({
  posts: t.router({
    list: publicProcedure.query(async () => {
      return p.socialPost.findMany();
    }),
    create: publicProcedure
      .input(z.object({ title: z.string() }))
      .mutation(async ({ input }) => {
        return p.socialPost.create({
          data: {
            title: input.title,
          },
        });
      }),
  }),
  courses: t.router({
    list: publicProcedure.query(async () => {
      const path = await import("path");
      const os = await import("os");

      const REPOS_PATH = path.join(os.homedir(), "repos", "total-typescript");

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

      const checkedCourses: ((typeof courses)[number] & {
        foundOnDisk: boolean;
      })[] = [];

      for (const course of courses) {
        if (!course.repoSlug) {
          checkedCourses.push({ ...course, foundOnDisk: false });
        } else {
          const result = await pathExists(
            path.join(REPOS_PATH, course.repoSlug ?? "")
          );

          checkedCourses.push({
            ...course,
            foundOnDisk: result.isOk() && result.value,
          });
        }
      }

      return checkedCourses.map((c, index) => ({
        ...c,
        exerciseCount: exerciseCounts[index]!,
      }));
    }),
  }),
});

export type AppRouter = typeof appRouter;
