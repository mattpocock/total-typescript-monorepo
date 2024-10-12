import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { p } from "../../db";

export const createServerFunction =
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

    return fn({ input, p: p });
  };

export const linkExistingPostToCollection = createServerFunction(
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
