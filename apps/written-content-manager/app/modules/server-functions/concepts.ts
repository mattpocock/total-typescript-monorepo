import { z } from "zod";
import { createServerFunction } from "./utils";

export const concepts = {
  list: createServerFunction(z.object({}), async ({ input, p }) => {
    return p.concept.findMany({
      where: {
        deletedAt: null,
        title: {
          not: "",
        },
      },
    });
  }),
  get: createServerFunction(
    z.object({
      id: z.string().uuid(),
    }),
    async ({ input, p }) => {
      return p.concept.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          workflowRuns: {
            select: {
              id: true,
              workflow: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });
    }
  ),
  create: createServerFunction(
    z.object({
      title: z.string(),
      content: z.string().default(""),
    }),
    async ({ input, p }) => {
      return p.concept.create({
        data: {
          title: input.title,
          content: input.content,
        },
      });
    }
  ),
  update: createServerFunction(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      content: z.string(),
    }),
    async ({ input, p }) => {
      return p.concept.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          content: input.content,
        },
      });
    }
  ),
  delete: createServerFunction(
    z.object({
      id: z.string().uuid(),
    }),
    async ({ input, p }) => {
      return p.concept.update({
        where: {
          id: input.id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }
  ),
};
