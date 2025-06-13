import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

export const figureOutWhichCTAToShow = async (transcript: string) => {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    output: "enum",
    enum: ["ai", "typescript"],
    system: `
      You are deciding which call to action to use for a video.
      The call to action will either point to totaltypescript.com, or aihero.dev.
      Return "ai" if the video is best suited for aihero.dev, and "typescript" if the video is best suited for totaltypescript.com.
      You will receive the full transcript of the video.

      If the video mentions AI, return "ai".
      Or if the video mentions TypeScript, return "typescript".
      If the video mentions Node, return "typescript".
      If the video mentions React, return "typescript".
      
    `,
    prompt: transcript,
  });

  return object;
};
