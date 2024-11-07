import { z } from "zod";
import { createServerFunction } from "./utils";
import { generateText } from "ai";
import { model } from "~/model";

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
        include: {
          steps: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              order: "asc",
            },
            select: {
              prompt: true,
              id: true,
            },
          },
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
    create: createServerFunction(
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
            version: {
              increment: 1,
            },
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
  runs: {
    runSteps: {
      upsert: createServerFunction(
        z.object({
          runId: z.string().uuid(),
          stepId: z.string().uuid(),
          output: z.string().optional(),
          input: z.string().optional(),
        }),
        async ({ input, p }) => {
          return p.contentWorkflowRunStep.upsert({
            where: {
              runId_stepId: {
                runId: input.runId,
                stepId: input.stepId,
              },
            },
            create: {
              stepId: input.stepId,
              runId: input.runId,
              output: input.output ?? "",
              input: input.input,
            },
            update: {
              output: input.output,
              input: input.input,
            },
          });
        }
      ),
      execute: createServerFunction(
        z.object({
          stepId: z.string().uuid(),
          runId: z.string().uuid(),
        }),
        async ({ input, p }) => {
          let prompt: string | undefined;
          let inputString: string;

          const step = await p.contentWorkflowStep.findUniqueOrThrow({
            where: {
              id: input.stepId,
            },
            select: {
              version: true,
              prompt: true,
              order: true,
              workflowId: true,
              runs: {
                where: {
                  runId: input.runId,
                },
                select: {
                  input: true,
                  output: true,
                },
              },
            },
          });

          const stepBefore = await p.contentWorkflowStep.findFirst({
            where: {
              order: {
                lt: step.order,
              },
              workflowId: step.workflowId,
              deletedAt: null,
            },
            orderBy: {
              order: "desc",
            },
            select: {
              id: true,
            },
          });

          prompt = step.prompt;

          if (!prompt) {
            throw new Error("The step's prompt is empty.");
          }

          const runStep = step.runs[0];

          if (!stepBefore) {
            if (!runStep?.input) {
              throw new Error(
                "An input is required for the first step in the run."
              );
            } else {
              inputString = runStep.input;
            }
          } else {
            const previousRunStep = await p.contentWorkflowRunStep.findUnique({
              where: {
                runId_stepId: {
                  runId: input.runId,
                  stepId: stepBefore.id,
                },
              },
              select: {
                output: true,
              },
            });

            if (!previousRunStep?.output) {
              throw new Error("The previous step has not generated an output.");
            }

            inputString = previousRunStep.output;
          }

          const result = await generateText({
            model,
            system: prompt,
            prompt: inputString,
            toolChoice: "required",
            tools: {
              answer: {
                parameters: z.object({
                  answer: z.string().describe("The answer to the prompt."),
                }),
                description: "The tool used to answer the prompt.",
              },
            },
          });

          const answer = result.toolCalls
            .map((toolCall) => toolCall.args.answer)
            .join("\n\n");

          if (!answer) {
            throw new Error("No answer was generated.");
          }

          return p.contentWorkflowRunStep.upsert({
            where: {
              runId_stepId: {
                runId: input.runId,
                stepId: input.stepId,
              },
            },
            create: {
              runId: input.runId,
              stepId: input.stepId,
              output: answer,
              version: step.version,
            },
            update: {
              output: answer,
              version: step.version,
            },
          });
        }
      ),
    },
    get: createServerFunction(
      z.object({
        id: z.string().uuid(),
      }),
      async ({ input, p }) => {
        return p.contentWorkflowRun.findUniqueOrThrow({
          where: {
            id: input.id,
          },
          include: {
            workflow: {
              select: {
                id: true,
                title: true,
                steps: {
                  orderBy: {
                    order: "asc",
                  },
                  where: {
                    deletedAt: null,
                  },
                  select: {
                    id: true,
                    prompt: true,
                    version: true,
                  },
                },
              },
            },
            steps: {
              orderBy: {
                step: {
                  order: "asc",
                },
              },
              where: {
                step: {
                  deletedAt: null,
                },
              },
              select: {
                input: true,
                output: true,
                version: true,
                stepId: true,
              },
            },
            concept: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });
      }
    ),
    create: createServerFunction(
      z.object({
        workflowId: z.string().uuid(),
      }),
      async ({ input, p }) => {
        return p.contentWorkflowRun.create({
          data: {
            workflowId: input.workflowId,
          },
        });
      }
    ),
    linkToConcept: createServerFunction(
      z.object({
        workflowRunId: z.string().uuid(),
        conceptId: z.string().uuid(),
      }),
      async ({ input, p }) => {
        return p.contentWorkflowRun.update({
          where: {
            id: input.workflowRunId,
          },
          data: {
            conceptId: input.conceptId,
          },
        });
      }
    ),
  },
};
