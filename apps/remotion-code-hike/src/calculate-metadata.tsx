import { z } from "zod";
import { CalculateMetadataFunction } from "remotion";
import Content from "./content.local.md";
import {
  Block,
  HighlightedCodeBlock,
  parseRoot,
} from "codehike/blocks";
import { createTwoslashFromCDN } from "twoslash-cdn";
import {
  HighlightedCode,
  highlight,
} from "codehike/code";
import type { CompilerOptions } from "typescript";
import { DEFAULT_STEP_DURATION } from "./constants";
import localStorageDriver from "unstorage/drivers/localstorage";
import { createStorage } from "unstorage";
import { meta } from "./meta";

const Schema = Block.extend({
  code: z.array(HighlightedCodeBlock as any),
} as any);

const compilerOptions: CompilerOptions = {
  target: 9 /* ES2022 */,
  strict: true,
  allowJs: true,
  checkJs: true,
  noEmit: true,
  module: 99 /* ESNext */,
  moduleResolution: 100 /* Bundler */,
  jsx: 4 /* ReactJSX */,
};

const twoslash = createTwoslashFromCDN({
  compilerOptions,
  storage: createStorage({
    // driver: localStorageDriver({
    //   base: "app:",
    // }),
  }),
});

type Props = {
  steps: HighlightedCode[];
  durations: number[] | undefined;
};

const FPS = 60;

const msToFrames = (duration: number) => {
  return (duration / 1000) * FPS;
};

export const calculateMetadata: CalculateMetadataFunction<
  Props
> = async () => {
  const { code, ...rest } = parseRoot(Content, Schema);

  const twoSlashedCode: HighlightedCode[] = [];

  for (const step of code) {
    await twoslash.prepareTypes(step.value);
    const twoslashResult = await twoslash.run(
      step.value,
      step.lang,
      {
        compilerOptions,
      },
    );
    const highlighted = await highlight(
      { ...step, value: twoslashResult.code },
      "dark-plus",
    );

    twoslashResult.queries.forEach(
      ({ text, line, character, length }) => {
        highlighted.annotations.push({
          name: "query-callout",
          query: text,
          lineNumber: line + 1,
          data: { character },
          fromColumn: character,
          toColumn: character + length,
        });
      },
    );

    twoslashResult.errors.forEach(
      ({ text, line, character, length }) => {
        highlighted.annotations.push({
          name: "error-callout",
          query: text,
          lineNumber: line + 1,
          data: { character },
          fromColumn: character,
          toColumn: character + length,
        });
      },
    );

    twoSlashedCode.push(highlighted);
  }

  const durationInFrames =
    meta.durations && meta.durations.length > 0
      ? msToFrames(
          meta.durations.reduce((a, b) => a + b, 0),
        )
      : (meta.slideDuration ?? DEFAULT_STEP_DURATION) *
        code.length;

  return {
    durationInFrames: Math.floor(durationInFrames),
    fps: FPS,
    props: {
      steps: twoSlashedCode,
      durations: meta.durations?.map(msToFrames),
    },
  };
};
