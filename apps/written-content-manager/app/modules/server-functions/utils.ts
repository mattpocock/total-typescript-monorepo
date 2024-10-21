import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { p } from "../../db";
import { getFS, type MyFS } from "./fs";

type ServerFunctionContext<TInput> = {
  input: TInput;
  p: PrismaClient;
  fs: MyFS;
};

export const createServerFunction =
  <TSchema extends z.AnyZodObject, TResult>(
    schema: TSchema,
    fn: (ctx: ServerFunctionContext<z.infer<TSchema>>) => Promise<TResult>
  ) =>
  (
    ...args: {} extends z.input<TSchema> ? [] : [unknownInput: z.input<TSchema>]
  ) => {
    const unknownInput: any = args[0];
    const input = schema.parse(unknownInput ?? {});

    const fs = getFS();

    return fn({ input, p: p, fs });
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
