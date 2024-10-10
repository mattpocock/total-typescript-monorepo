import { pathExists } from "@total-typescript/shared";
import { readFileSync } from "fs";
import path from "path";
import { z } from "zod";
import { p } from "~/db";
import { Checkbox } from "~/schema";
import { getVSCodeFilesForPost } from "~/vscode-utils";
import { publicProcedure, t } from "./trpc";
import { collectionsRouter } from "./collections";

export const appRouter = t.router({
  collections: collectionsRouter,
  posts: t.router({
    get: publicProcedure
      .input(
        z.object({
          id: z.string(),
        })
      )
      .query(async ({ input }) => {
        const files = await getVSCodeFilesForPost(input.id);
        const post = await p.socialPost.findUniqueOrThrow({
          where: {
            id: input.id,
          },
          include: {
            collections: {
              select: {
                collection: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        });

        return {
          ...post,
          files: files.map((file) => ({
            path: path.basename(file),
            fullPath: file,
            content: readFileSync(file, "utf-8"),
          })),
        };
      }),
    list: publicProcedure.query(async () => {
      return p.socialPost.findMany({
        where: {
          title: {
            not: "",
          },
          deleted: false,
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          collections: {
            where: {
              collection: {
                deleted: false,
              },
            },
            select: {
              collectionId: true,
            },
          },
        },
      });
    }),
    create: publicProcedure
      .input(z.object({ title: z.string() }))
      .mutation(async ({ input }) => {
        const post = await p.socialPost.create({
          data: {
            title: input.title,
          },
        });
        await p.analyticsEvent.create({
          data: {
            type: "POST_CREATED",
            payload: {
              postId: post.id,
            },
          },
        });
        return post;
      }),
    update: publicProcedure
      .input(
        z
          .object({
            id: z.string(),
            title: z.string(),
            learningGoal: z.string().optional(),
            notes: z.string().optional(),
            postedAt: z.union([
              z.enum([""]).transform(() => null),
              z.string().datetime().optional(),
            ]),
            isViral: Checkbox.optional(),
          })
          .strict()
      )
      .mutation(async ({ input }) => {
        const post = await p.socialPost.findUniqueOrThrow({
          where: {
            id: input.id,
          },
          select: {
            postedAt: true,
          },
        });

        if (post.postedAt === null && input.postedAt !== null) {
          await p.analyticsEvent.create({
            data: {
              type: "POST_MARKED_AS_POSTED",
              payload: {
                postId: input.id,
              },
            },
          });
        }
        return p.socialPost.update({
          where: {
            id: input.id,
          },
          data: {
            title: input.title,
            learningGoal: input.learningGoal,
            notes: input.notes,
            postedAt: input.postedAt,
            isViral: input.isViral,
          },
        });
      }),
    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await p.analyticsEvent.create({
          data: {
            type: "POST_DELETED",
            payload: {
              postId: input.id,
            },
          },
        });
        return await p.socialPost.update({
          where: {
            id: input.id,
          },
          data: {
            deleted: true,
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
