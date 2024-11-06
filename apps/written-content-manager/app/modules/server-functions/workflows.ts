import { z } from "zod";
import { createServerFunction } from "./utils";

export const workflows = {
  list: createServerFunction(z.object({}), async ({ input, p }) => {
    return p.contentWorkflow.findMany({
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
      return p.contentWorkflow.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
    }
  ),
  create: createServerFunction(
    z.object({
      title: z.string(),
    }),
    async ({ input, p }) => {
      return p.contentWorkflow.create({
        data: {
          title: input.title,
        },
      });
    }
  ),
  update: createServerFunction(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
    }),
    async ({ input, p }) => {
      return p.contentWorkflow.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
        },
      });
    }
  ),
  delete: createServerFunction(
    z.object({
      id: z.string().uuid(),
    }),
    async ({ input, p }) => {
      return p.contentWorkflow.update({
        where: {
          id: input.id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }
  ),
  steps: {
    add: createServerFunction(
      z.object({
        workflowId: z.string().uuid(),
        prompt: z.string(),
      }),
      async ({ input, p }) => {
        const contentWorkflowStepWithHighestOrder =
          await p.contentWorkflowStep.findFirst({
            where: {
              workflowId: input.workflowId,
            },
            orderBy: {
              order: "desc",
            },
          });
        return p.contentWorkflowStep.create({
          data: {
            prompt: input.prompt,
            order: contentWorkflowStepWithHighestOrder
              ? contentWorkflowStepWithHighestOrder.order + 1
              : 0,
            workflow: {
              connect: {
                id: input.workflowId,
              },
            },
          },
        });
      }
    ),
    update: createServerFunction(
      z.object({
        id: z.string().uuid(),
        prompt: z.string(),
      }),
      async ({ input, p }) => {
        return p.contentWorkflowStep.update({
          where: {
            id: input.id,
          },
          data: {
            prompt: input.prompt,
          },
        });
      }
    ),
    delete: createServerFunction(
      z.object({
        id: z.string().uuid(),
      }),
      async ({ input, p }) => {
        return p.contentWorkflowStep.update({
          where: {
            id: input.id,
          },
          data: {
            deletedAt: new Date(),
          },
        });
      }
    ),
  },
};
