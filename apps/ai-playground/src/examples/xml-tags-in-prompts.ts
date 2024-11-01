import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const allowedLinks = [
  `https://www.totaltypescript.com/how-to-create-an-npm-package`,
  `https://www.totaltypescript.com/why-i-dont-like-typescript-enums`,
  `https://www.totaltypescript.com/is-typescript-just-a-linter`,
];

console.clear();

const result = await streamText({
  model: openai("gpt-4o-mini"),
  system: `You are an AI assistant helping find articles
  to help with a query.
  
  These are the links you are allowed to use:
  <links>${allowedLinks.join("\n")}</links>

  If an article does not exist which answers the query,
  do not improvise a response.
  `,
  prompt: `Give me information about enums.`,
});

for await (const text of result.textStream) {
  process.stdout.write(text);
}

console.log("\nComplete!");
