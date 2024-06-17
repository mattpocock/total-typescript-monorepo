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

import Content from "./content.local.md";
import meta from "./meta.local.json";
import { calculateMetadata } from "./calculate-metadata";
import { DEFAULT_STEP_DURATION } from "./constants";

const { code } = parseRoot(Content, Schema);

const resolvedMeta = meta as {
  width?: number;
  height?: number;
};

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
      width={resolvedMeta.width || 1400}
      height={resolvedMeta.height || 1400}
      calculateMetadata={calculateMetadata}
    />
  );
};
