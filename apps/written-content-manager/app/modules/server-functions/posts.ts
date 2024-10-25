import { z } from "zod";
import { createServerFunction } from "./utils";
import { getPostsDir, getVSCodeFilesForPost } from "~/vscode-utils";
import path from "path";
import { Checkbox } from "~/schema";
import { editPostUrl } from "~/routes";

export const posts = {
  get: createServerFunction(
    z.object({
      id: z.string().uuid(),
    }),
    async ({ input, p, fs, paths }) => {
      const files = await getVSCodeFilesForPost(input.id);

      const post = await p.socialPost.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          collections: {
            where: {
              collection: {
                deleted: false,
                title: {
                  not: "",
                },
              },
            },
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
          content: fs.readFileSync(file, "utf-8"),
        })),
      };
    }
  ),

  list: createServerFunction(z.object({}), async ({ input, p }) => {
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

  update: createServerFunction(
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
        isViral: Checkbox.default("off"),
      })
      .strict(),
    async ({ input, p }) => {
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
          title: input.title.trim(),
          learningGoal: input.learningGoal,
          notes: input.notes,
          postedAt: input.postedAt,
          isViral: input.isViral,
        },
      });
    }
  ),

  create: createServerFunction(
    z.object({
      title: z.string(),
    }),
    async ({ input, p }) => {
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
    }
  ),

  delete: createServerFunction(
    z.object({ id: z.string().uuid() }),
    async ({ input, p }) => {
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
    }
  ),

  viewInVSCode: createServerFunction(
    z.object({ id: z.string().uuid() }),
    async ({ input, p, fs, paths }) => {
      const postsDir = getPostsDir(input.id);

      const files = await getVSCodeFilesForPost(input.id);
      await fs.ensureDir(postsDir);

      if (!files[0]) {
        const playgroundFile = path.join(postsDir, "playground.ts");
        await fs.writeFile(
          playgroundFile,
          `// http://localhost:3004${editPostUrl(input.id!)}`
        );

        const notesFile = path.join(postsDir, "notes.md");
        await fs.writeFile(
          notesFile,
          [
            `# Notes`,
            ``,
            `http://localhost:3004${editPostUrl(input.id!)}`,
          ].join("\n")
        );

        const threadFile = path.join(postsDir, "thread.md");
        await fs.writeFile(threadFile, ``);
        await fs.openInVSCode(threadFile);
      } else {
        const threadFile = files.find((file) => file.includes("thread.md"));
        await fs.openInVSCode(threadFile ?? files[0]);
      }
    }
  ),

  addNewCollection: createServerFunction(
    z.object({
      id: z.string().uuid(),
    }),
    async ({ input, p }) => {
      const collection = await p.socialPostCollection.create({
        data: {
          title: "",
          posts: {
            create: {
              order: 0,
              socialPostId: input.id,
            },
          },
        },
      });

      return collection;
    }
  ),
};
