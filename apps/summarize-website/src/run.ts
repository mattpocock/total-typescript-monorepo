import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { execSync, spawnSync } from "child_process";
import { writeFileSync } from "fs";
import { htmlToText } from "html-to-text";
import { createHash } from "crypto";

const flagshipModel = openai("gpt-4o");

const summarizeText = async (text: string): Promise<string> => {
  console.log("Summarizing text...");
  const result = await generateText({
    model: flagshipModel,
    system: `You are a summarizer.
    You will be given some text which contains an article.
    Summarize the text.
    Use multiple paragraphs in your summary.
    Place the summary in <summary> tags.
    Also, return a list of the 5-10 most important quotes
    from the article.
    Each quote must be a direct quote from the original text.
    Place each quote in <quote> tags.`,
    prompt: text,
  });

  return result.text;
};

const summarizeWebsite = async (
  url: string
): Promise<{
  websiteContent: string;
  summary: string;
}> => {
  console.log("Fetching website...");
  const response = await fetch(url, {
    method: "GET",
  });
  if (!response.ok) {
    console.log(response.status);
    throw new Error("Failed to fetch website");
  }
  const rawWebsiteContent = await response.text();

  const websiteText = htmlToText(rawWebsiteContent);
  // const cleanedText = await stripJavaScriptAndHtml(approximateTextContent);

  return {
    websiteContent: websiteText,
    summary: await summarizeText(websiteText),
  };
};

export const run = async (url: string) => {
  const result = await summarizeWebsite(url);

  const hash = createHash("md5");

  hash.update(url);

  const filenameSuffix = hash.digest("hex").slice(0, 6);

  const filename = `./summary.${filenameSuffix}.md`;

  writeFileSync(
    filename,
    ["# Summary", result.summary, "# Content", result.websiteContent].join(
      "\n\n"
    )
  );

  spawnSync(`code`, [filename], { stdio: "inherit" });
};
