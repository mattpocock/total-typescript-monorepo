import type { PrismaClient } from "@prisma/client";
import { TOTAL_TYPESCRIPT_REPOS_FOLDER } from "@total-typescript/shared";
import { z } from "zod";
import {
  getExercisePlaygroundRootPath,
  getPostsPlaygroundRootPath,
} from "~/vscode-utils";
import { p } from "../../db";
import { fs } from "../../fs";

type Paths = {
  exercisePlaygroundPath: string;
  postsPlaygroundPath: string;
  reposDir: string;
};

declare global {
  var testPaths: Paths | undefined;
}

type ServerFunctionContext<TInput> = {
  input: TInput;
  p: PrismaClient;
  fs: typeof fs;
  paths: Paths;
};

export const createServerFunction =
  <TSchema extends z.AnyZodObject, TResult>(
    schema: TSchema,
    fn: (ctx: ServerFunctionContext<z.infer<TSchema>>) => Promise<TResult>
  ) =>
  async (
    ...args: {} extends z.input<TSchema>
      ? [unknownInput?: z.input<TSchema>]
      : [unknownInput: z.input<TSchema>]
  ) => {
    const unknownInput: any = args[0];
    const input = schema.strict().parse(unknownInput ?? {});

    return await fn({
      input,
      p,
      fs,
      paths: {
        exercisePlaygroundPath: getExercisePlaygroundRootPath(),
        postsPlaygroundPath: getPostsPlaygroundRootPath(),
        reposDir:
          /* v8 ignore next */
          globalThis.testPaths?.reposDir ?? TOTAL_TYPESCRIPT_REPOS_FOLDER,
      },
    });
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
