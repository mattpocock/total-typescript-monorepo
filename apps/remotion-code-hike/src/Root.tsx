import "./tailwind.css";
import { Composition } from "remotion";
import { Main } from "./Main";
import {
  Block,
  HighlightedCodeBlock,
  parseRoot,
} from "codehike/blocks";
import { z } from "zod";

const Schema = Block.extend({
  code: z.array(HighlightedCodeBlock as any),
} as any);

import Content from "./content.md";
import { calculateMetadata } from "./calculate-metadata";
import { DEFAULT_STEP_DURATION } from "./constants";
const { code } = parseRoot(Content, Schema);

export const RemotionRoot = () => {
  return (
    <Composition
      id="CodeHikeExample"
      component={Main}
      defaultProps={{ steps: code }}
      fps={60}
      durationInFrames={
        DEFAULT_STEP_DURATION * code.length
      }
      width={1400}
      height={600}
      calculateMetadata={calculateMetadata}
    />
  );
};
