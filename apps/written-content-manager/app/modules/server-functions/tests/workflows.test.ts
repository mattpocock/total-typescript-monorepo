import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  vitest,
} from "vitest";
import { serverFunctions } from "../server-functions";
import { generateText } from "ai";

vitest.mock("ai", () => ({
  generateText: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("workflows", () => {
  describe("runs", () => {
    describe("runSteps", () => {
      describe("execute", () => {
        it("Should fail if the runStep is first in the order and does not contain an input field", async () => {
          const workflow = await serverFunctions.workflows.create({
            title: "Concept To Post",
          });

          const step = await serverFunctions.workflows.steps.create({
            prompt: "Create a concept",
            workflowId: workflow.id,
          });

          const run = await serverFunctions.workflows.runs.create({
            workflowId: workflow.id,
          });

          await serverFunctions.workflows.runs.runSteps.upsert({
            runId: run.id,
            stepId: step.id,
          });

          await expect(
            serverFunctions.workflows.runs.runSteps.execute({
              stepId: step.id,
              runId: run.id,
            })
          ).rejects.toThrow(
            "An input is required for the first step in the run."
          );
        });
        it("Should fail if the prompt is empty", async () => {
          const workflow = await serverFunctions.workflows.create({
            title: "Concept To Post",
          });

          const step = await serverFunctions.workflows.steps.create({
            prompt: "",
            workflowId: workflow.id,
          });

          const run = await serverFunctions.workflows.runs.create({
            workflowId: workflow.id,
          });

          await serverFunctions.workflows.runs.runSteps.upsert({
            runId: run.id,
            stepId: step.id,
          });

          await expect(
            serverFunctions.workflows.runs.runSteps.execute({
              stepId: step.id,
              runId: run.id,
            })
          ).rejects.toThrow("The step's prompt is empty.");
        });

        it("Should fail if the runStep is NOT first and the previous runStep does not have an output field", async () => {
          const workflow = await serverFunctions.workflows.create({
            title: "Concept To Post",
          });

          const step1 = await serverFunctions.workflows.steps.create({
            prompt: "Create a concept",
            workflowId: workflow.id,
          });

          const step2 = await serverFunctions.workflows.steps.create({
            prompt: "Generate a post",
            workflowId: workflow.id,
          });

          const run = await serverFunctions.workflows.runs.create({
            workflowId: workflow.id,
          });

          await serverFunctions.workflows.runs.runSteps.upsert({
            runId: run.id,
            stepId: step2.id,
          });

          await expect(
            serverFunctions.workflows.runs.runSteps.execute({
              stepId: step2.id,
              runId: run.id,
            })
          ).rejects.toThrow("The previous step has not generated an output.");
        });

        it("Should error if the tool was not called", async () => {
          const workflow = await serverFunctions.workflows.create({
            title: "Concept To Post",
          });

          const step = await serverFunctions.workflows.steps.create({
            prompt: "Create a concept",
            workflowId: workflow.id,
          });

          const run = await serverFunctions.workflows.runs.create({
            workflowId: workflow.id,
          });

          await serverFunctions.workflows.runs.runSteps.upsert({
            runId: run.id,
            stepId: step.id,
            input: "My Concept",
          });

          (generateText as any).mockResolvedValueOnce({ toolCalls: [] });

          await expect(
            serverFunctions.workflows.runs.runSteps.execute({
              stepId: step.id,
              runId: run.id,
            })
          ).rejects.toThrow("No answer was generated.");
        });

        it("Should execute", async () => {
          const workflow = await serverFunctions.workflows.create({
            title: "Concept To Post",
          });

          const step = await serverFunctions.workflows.steps.create({
            prompt: "Create a concept",
            workflowId: workflow.id,
          });

          const run = await serverFunctions.workflows.runs.create({
            workflowId: workflow.id,
          });

          (generateText as any).mockResolvedValueOnce({
            toolCalls: [
              {
                args: {
                  answer: "Expected Output",
                },
              },
            ],
          });

          await serverFunctions.workflows.runs.runSteps.upsert({
            runId: run.id,
            stepId: step.id,
            input: "My Concept",
          });

          await serverFunctions.workflows.runs.runSteps.execute({
            stepId: step.id,
            runId: run.id,
          });

          const runInDb = await serverFunctions.workflows.runs.get({
            id: run.id,
          });

          expect(runInDb).toMatchObject({
            steps: [
              {
                input: "My Concept",
                output: "Expected Output",
              },
            ],
          });

          expect((generateText as any).mock.calls).toMatchObject([
            [
              {
                system: "Create a concept",
                prompt: "My Concept",
              },
            ],
          ]);
        });

        it("Should update the version of the runStep to be in line with the step", async () => {
          const workflow = await serverFunctions.workflows.create({
            title: "Concept To Post",
          });

          const step = await serverFunctions.workflows.steps.create({
            prompt: "Create a concept",
            workflowId: workflow.id,
          });

          const run = await serverFunctions.workflows.runs.create({
            workflowId: workflow.id,
          });

          await serverFunctions.workflows.runs.runSteps.upsert({
            runId: run.id,
            stepId: step.id,
            input: "My Concept",
          });

          await serverFunctions.workflows.steps.update({
            id: step.id,
            prompt: "A brand new prompt",
          });

          (generateText as any).mockResolvedValueOnce({
            toolCalls: [
              {
                args: {
                  answer: "Expected Output",
                },
              },
            ],
          });

          await serverFunctions.workflows.runs.runSteps.execute({
            stepId: step.id,
            runId: run.id,
          });

          const runInDb = await serverFunctions.workflows.runs.get({
            id: run.id,
          });

          expect(runInDb).toMatchObject({
            workflow: {
              steps: [
                {
                  prompt: "A brand new prompt",
                  version: 2,
                },
              ],
            },
            steps: [
              {
                input: "My Concept",
                output: "Expected Output",
                version: 2,
              },
            ],
          });

          expect((generateText as any).mock.calls).toMatchObject([
            [
              {
                system: "A brand new prompt",
                prompt: "My Concept",
              },
            ],
          ]);
        });
      });
    });
  });
});
