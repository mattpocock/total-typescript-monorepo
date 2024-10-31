import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";

const embeddingModel = openai.embedding("text-embedding-ada-002");

const embeddings = await embedMany({
  model: embeddingModel,
  values: [
    "Matt has a meeting at 8PM with Steve the monkey.",
    "Steve the monkey runs a banana stand.",
    "Matt loves bananas.",
    "The person speaking to you is Matt.",
  ],
});

console.dir(embeddings.embeddings, { maxArrayLength: 2 });

// const result = await streamText({
//   model: openai("gpt-4o-mini"),
//   system: `You are a helpful AI assistant.
//   You are helping Matt with his schedule.
//   Matt is the person speaking to you.
//   Check your knowledge base before answering any questions.
//   Only respond to questions using information from tool calls.`,
//   prompt: `What time is my meeting with Steve?`,
// });

// for await (const text of result.textStream) {
//   process.stdout.write(text);
// }

// console.log("\nComplete!");
