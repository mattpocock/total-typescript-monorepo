import { z } from "zod";
import { createServerFunction, linkExistingPostToCollection } from "./utils";

export const collections = {
  list: createServerFunction(
    z.object({
      notConnectedToPostId: z.string().uuid().optional(),
    }),
    async ({ input, p }) => {
      return p.socialPostCollection.findMany({
        where: {
          deleted: false,
          title: {
            not: "",
          },
          ...(input.notConnectedToPostId && {
            posts: {
              none: {
                socialPostId: input.notConnectedToPostId,
              },
            },
          }),
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
    }
  ),

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

  create: createServerFunction(
    z.object({ title: z.string().optional() }),
    async ({ input, p }) => {
      return p.socialPostCollection.create({
        data: {
          title: input.title || "",
        },
      });
    }
  ),

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

      await p.analyticsEvent.create({
        data: {
          type: "POST_CREATED",
          payload: {
            postId: post.id,
          },
        },
      });
      return await linkExistingPostToCollection({
        collectionId: input.collectionId,
        postId: post.id,
      });
    }
  ),

  removePost: createServerFunction(
    z.object({
      collectionId: z.string().uuid(),
      postId: z.string().uuid(),
    }),
    async ({ input, p }) => {
      return p.socialPostToSocialPostCollection.delete({
        where: {
          socialPostId_collectionId: {
            collectionId: input.collectionId,
            socialPostId: input.postId,
          },
        },
      });
    }
  ),
};
