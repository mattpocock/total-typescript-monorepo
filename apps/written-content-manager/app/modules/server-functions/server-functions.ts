import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createServerFunction =
  <TSchema extends z.AnyZodObject, TResult>(
    schema: TSchema,
    fn: (ctx: { input: z.output<TSchema>; p: PrismaClient }) => Promise<TResult>
  ) =>
  (
    ...args: {} extends z.output<TSchema>
      ? []
      : [unknownInput: z.output<TSchema>]
  ) => {
    const unknownInput: any = args[0];
    const input = schema.parse(unknownInput ?? {});

    return fn({ input, p: prisma });
  };

const linkExistingPostToCollection = createServerFunction(
  z.object({
    collectionId: z.string().uuid(),
    postId: z.string().uuid(),
  }),
  async ({ input, p }) => {
    const collectionWithHighestOrder =
      await p.socialPostToSocialPostCollection.findFirst({
        where: {
          collectionId: input.collectionId,
        },
        orderBy: {
          order: "desc",
        },
        select: {
          order: true,
        },
      });
    return p.socialPostToSocialPostCollection.create({
      data: {
        order: collectionWithHighestOrder
          ? collectionWithHighestOrder.order + 1
          : 0,
        socialPostId: input.postId,
        collectionId: input.collectionId,
      },
    });
  }
);
export const serverFunctions = {
  collections: {
    list: createServerFunction(z.object({}), async ({ input, p }) => {
      return p.socialPostCollection.findMany({
        where: {
          deleted: false,
          title: {
            not: "",
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          _count: {
            select: {
              posts: {
                where: {
                  socialPost: {
                    deleted: false,
                  },
                },
              },
            },
          },
        },
      });
    }),

    get: createServerFunction(
      z.object({ id: z.string().uuid() }),
      async ({ input, p }) => {
        return p.socialPostCollection.findUniqueOrThrow({
          where: {
            id: input.id,
            deleted: false,
          },
          select: {
            id: true,
            title: true,
            notes: true,
            posts: {
              select: {
                socialPost: {
                  select: {
                    id: true,
                    title: true,
                    isViral: true,
                    postedAt: true,
                    learningGoal: true,
                  },
                },
              },
              where: {
                socialPost: {
                  deleted: false,
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

    postsNotInCollection: createServerFunction(
      z.object({ id: z.string().uuid() }),
      async ({ input, p }) => {
        return p.socialPost.findMany({
          where: {
            collections: {
              none: {
                collectionId: input.id,
              },
            },
            deleted: false,
            title: {
              not: "",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        });
      }
    ),

    update: createServerFunction(
      z.object({ id: z.string().uuid(), title: z.string(), notes: z.string() }),
      async ({ input, p }) => {
        return p.socialPostCollection.update({
          where: {
            id: input.id,
            deleted: false,
          },
          data: {
            title: input.title,
            notes: input.notes,
          },
        });
      }
    ),

    create: createServerFunction(z.object({}), async ({ input, p }) => {
      return p.socialPostCollection.create({
        data: {
          title: "",
        },
      });
    }),

    delete: createServerFunction(
      z.object({ id: z.string().uuid() }),
      async ({ input, p }) => {
        return p.socialPostCollection.update({
          where: {
            id: input.id,
          },
          data: {
            deleted: true,
          },
        });
      }
    ),

    linkExistingPost: linkExistingPostToCollection,

    addNewPost: createServerFunction(
      z.object({
        collectionId: z.string().uuid(),
      }),
      async ({ input, p }) => {
        const post = await p.socialPost.create({
          data: {
            title: "",
          },
        });
        return await linkExistingPostToCollection({
          collectionId: input.collectionId,
          postId: post.id,
        });
      }
    ),
  },
};
