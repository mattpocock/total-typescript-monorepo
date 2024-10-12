import { p } from "~/db";
import { publicProcedure, t } from "./trpc";
import { z } from "zod";

const addPostToCollection = async (props: {
  collectionId: string;
  postId: string;
}) => {
  const collectionWithHighestOrder =
    await p.socialPostToSocialPostCollection.findFirst({
      where: {
        collectionId: props.collectionId,
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
      socialPostId: props.postId,
      collectionId: props.collectionId,
    },
  });
};

export const collectionsRouter = t.router({
  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return p.socialPostCollection.update({
        where: {
          id: input.id,
        },
        data: {
          deleted: true,
        },
      });
    }),
  addPost: publicProcedure
    .input(
      z.object({
        collectionId: z.string(),
        postId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return addPostToCollection({
        collectionId: input.collectionId,
        postId: input.postId,
      });
    }),
  addNewPost: publicProcedure
    .input(
      z.object({
        collectionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const post = await p.socialPost.create({
        data: {
          title: "",
        },
      });

      return addPostToCollection({
        collectionId: input.collectionId,
        postId: post.id,
      });
    }),
  removePost: publicProcedure
    .input(
      z.object({
        collectionId: z.string(),
        postId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return p.socialPostToSocialPostCollection.delete({
        where: {
          socialPostId_collectionId: {
            collectionId: input.collectionId,
            socialPostId: input.postId,
          },
        },
      });
    }),
  postsNotInCollection: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
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
    }),
});
