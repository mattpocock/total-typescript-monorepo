import { openai } from "@ai-sdk/openai";
import { generateText, tool } from "ai";
import { z } from "zod";

const country = `Djiboutia`;

const example = await generateText({
  model: openai("gpt-4o-mini"),
  prompt: `What is the capital of ${country}?`,
  tools: {
    answer: tool({
      description: "A tool for providing the final answer.",
      parameters: z.object({
        capital: z
          .string()
          .or(z.literal("unknown"))
          .describe(
            "The capital of the given country. If unknown, use 'unknown'.",
          ),
        confidence: z
          .number()
          .int()
          .describe(
            "A number between 0 and 100 representing how confident you are with the final result.",
          ),
      }),
    }),
  },
  toolChoice: "required",
});

console.dir(example.toolCalls, { depth: null });
console.log("\nComplete!");
