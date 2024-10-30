import { openai } from "@ai-sdk/openai";
import { generateText, tool } from "ai";
import { z } from "zod";

const country = `Taiwan`;

const example = await generateText({
  model: openai("gpt-4o-mini"),
  prompt: `What is the capital of ${country}?`,
  tools: {
    answer: tool({
      description: "A tool for providing the final answer.",
      parameters: z.object({
        country: z.string().describe("The country to find the capital of."),
        capital: z
          .string()
          .or(z.literal("unknown"))
          .describe(
            "The capital of the given country. If unknown, use 'unknown'."
          ),
        confidence: z
          .enum(["high", "medium", "low"])
          .describe("The confidence level of the answer."),
      }),
    }),
  },
  toolChoice: "required",
});

console.dir(example.toolCalls, { depth: null });
console.log("\nComplete!");
