import { pathExists } from "@total-typescript/shared";
import { p } from "~/db";
import { publicProcedure, t } from "./trpc";

export const appRouter = t.router({
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
