import {
  Block,
  HighlightedCodeBlock,
  parseRoot,
} from "codehike/blocks";
import { highlight } from "codehike/code";
import { CalculateMetadataFunction } from "remotion";
import { z } from "zod";
import { DEFAULT_STEP_DURATION } from "./constants";
import Content from "./content.local.md";
import { meta } from "./meta";
import { compilerOptions, twoslash } from "./twoslash";

const MyHighlightedCodeBlock =
  HighlightedCodeBlock.extend({
    terminalOutput: HighlightedCodeBlock.optional(),
  });
const Schema = Block.extend({
  code: z.array(MyHighlightedCodeBlock),
});

export type MyHighlightedCode = z.infer<
  typeof MyHighlightedCodeBlock
>;

type Props = {
  steps: MyHighlightedCode[];
  durations: number[] | undefined;
};

const FPS = 60;

const msToFrames = (duration: number) => {
  return (duration / 1000) * FPS;
};

export const calculateMetadata: CalculateMetadataFunction<
  Props
> = async () => {
  const { code } = parseRoot(Content, Schema);

  const twoSlashedCode: MyHighlightedCode[] = [];

  for (const step of code) {
    const twoslashResult = await twoslash.run(
      step.value,
      step.lang,
      {
        compilerOptions: compilerOptions,
      },
    );
    const highlighted: MyHighlightedCode =
      await highlight(
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

    if (step.meta.includes("nodeslash")) {
      const terminalOutput = await fetch(
        "http://localhost:3006",
        {
          method: "POST",
          body: step.code,
        },
      ).then((res) => res.text());

      highlighted.terminalOutput = await highlight(
        {
          value: terminalOutput,
          lang: "txt",
          meta: "",
        },
        "dark-plus",
      );
    }

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
