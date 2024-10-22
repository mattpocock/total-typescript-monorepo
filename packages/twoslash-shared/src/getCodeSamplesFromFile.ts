import { getLangFromCodeFence } from "./getLangFromCodeFence.js";

const CODE_BLOCKS_REGEX = /```[\s\S]*?```/g;

export function* getCodeSamplesFromFile(fileContents: string) {
  let match;

  while ((match = CODE_BLOCKS_REGEX.exec(fileContents))) {
    const code = match[0];

    const [fence, ...rest] = code.split("\n");

    if (!fence) {
      continue;
    }

    const { lang, mode } = getLangFromCodeFence(fence);

    // Remove the final fence
    rest.pop();

    yield {
      code: rest.join("\n"),
      lang: lang ?? "ts",
      mode,
    };
  }
}
