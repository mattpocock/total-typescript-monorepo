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
const resolvedMeta = meta as {
  width?: number;
  height?: number;
  durations?: number[];
};
import { calculateMetadata } from "./calculate-metadata";
import { DEFAULT_STEP_DURATION } from "./constants";

const { code } = parseRoot(Content, Schema);

export const RemotionRoot = () => {
  return (
    <Composition
      id="CodeHikeExample"
      component={Main}
      defaultProps={{
        steps: code,
        durations: [],
      }}
      width={resolvedMeta.width || 1920}
      height={resolvedMeta.height || 1080}
      calculateMetadata={calculateMetadata}
    />
  );
};
