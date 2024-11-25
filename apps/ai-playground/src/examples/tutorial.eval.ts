import { Eval, wrapAISDKModel } from "braintrust";
import { LevenshteinScorer } from "autoevals";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { readFileSync } from "fs";

const context = readFileSync("./src/assets/object-book-content.md", "utf-8");

const generateConceptPage = async (title: string, essayPlan: string) => {
  const result = await generateText({
    model: wrapAISDKModel(openai.chat("gpt-4o")),
    system: `
      You are a technical writer writing some documentation
      for a feature of the TypeScript programming language.
      You will receive some context - a chapter of a book
      outlining some background information about a concept.
      The context will be wrapped in a <context> tag.
      You will also receive the title of the reference
      page you will create.
      The title will be wrapped in a <title> tag.
      You will also receive an essay plan for the page.
      The essay plan will be wrapped in an <essay-plan> tag.
      Follow the essay plan if you like, but feel free to
      deviate from it if you think it will improve the page.
    `,
    prompt: `
    <context>
      ${context}
    </context>
    <essay-plan>
      ${essayPlan}
    </essay-plan>
    <title>${title}</title>
    `,
  });

  return await removeUnwantedSections(result.text);
};

const removeUnwantedSections = async (essay: string) => {
  const result = await generateText({
    model: wrapAISDKModel(openai.chat("gpt-4o-mini")),
    system: `
      You will receive an essay.
      Remove the introduction and conclusion from the essay.
      Remove any practical exercises from the essay, if
      they are present.
      Return the essay.
    `,
    prompt: `
      ${essay}
    `,
  });

  return result.text;
};

// const generateConceptPageWithCritique = async (opts: {
//   title: string;
//   prevPage: string;
//   critique: string;
// }) => {
//   const result = await generateText({
//     model: wrapAISDKModel(openai.chat("gpt-4o")),
//     system: `
//       You are a technical writer editing some documentation
//       for a feature of the TypeScript programming language.
//       You will receive a previous version of this page.
//       The page will be wrapped in a <page> tag.
//       You will also receive a critique of the page.
//       The critique will be wrapped in a <critique> tag.
//       You will receive some context - a chapter of a book
//       outlining some background information about a concept.
//       The context will be wrapped in a <context> tag.
//       You will also receive the title of the reference
//       page you will create.
//       The title will be wrapped in a <title> tag.
//       Rewrite the page based on the critique.
//       Use your own judgement to decide which parts of the
//       critique to incorporate.
//     `,
//     prompt: `
//     <context>
//       ${context}
//     </context>
//     <title>${opts.title}</title>
//     <page>${opts.prevPage}</page>
//     <critique>${opts.critique}</critique>
//     `,
//   });

//   return result.text;
// };

// const critiqueConceptPage = async (conceptPage: string) => {
//   const result = await generateText({
//     model: wrapAISDKModel(openai.chat("gpt-4o")),
//     system: `
//       You are a teacher reviewing a reference page
//       for a feature of the TypeScript programming language.
//       You will receive the page to review.
//       The page will be wrapped in a <page> tag.
//       You will receive some supporting information - a
//       chapter of a book outlining some background
//       information about the concept.
//       The context will be wrapped in a <context> tag.
//       Provide detailed recommendations, including requests
//       for length, depth, style etc.
//     `,
//     prompt: `

//     <context>
//       ${context}
//     </context>
//     <page>
//       ${conceptPage}
//     </page>
//     `,
//   });

//   return result.text;
// };

const createEssayPlan = async (prompt: string) => {
  const result = await generateText({
    model: wrapAISDKModel(openai.chat("gpt-4o")),
    system: `
      You are a technical writer creating an essay plan
      for a documentation page for a feature of the
      TypeScript programming language.
      You will receive some context - a chapter of a book
      outlining some background information about a concept.
      The context will be wrapped in a <context> tag.
      You will also receive the title of the essay plan.
      The title will be wrapped in a <title> tag.
      Provide code examples as part of the essay plan.
      Do not include a conclusion in the essay plan.
      Do not include additional resources in the essay plan.
    `,
    prompt: `
    <context>
      ${context}
    </context>
    <title>${prompt}</title>
    `,
  });

  const essayPlan = result.text;

  return essayPlan;
};

Eval("Generate concept page", {
  data: () => {
    return [
      {
        input: "Intersections vs `interface extends`",
      },
      {
        input: "The Record Type",
      },
      {
        input: "`Partial` and `Required`",
      },
      {
        input: "`Pick` and `Omit`",
      },
    ];
  },
  task: async (title) => {
    const essayPlan = await createEssayPlan(title);
    const conceptPage = await generateConceptPage(title, essayPlan);

    return conceptPage;
  },
  scores: [],
});
