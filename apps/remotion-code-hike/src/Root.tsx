import {
  Block,
  HighlightedCodeBlock,
  parseRoot,
} from "codehike/blocks";
import { Composition } from "remotion";
import { z } from "zod";
import { Main } from "./Main";
import "./tailwind.css";

const Schema = Block.extend({
  code: z.array(HighlightedCodeBlock as any),
} as any);

import { calculateMetadata } from "./calculate-metadata";
import Content from "./content.local.md";
import { meta } from "./meta";

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
      width={meta.width || 1920}
      height={meta.height || 1080}
      calculateMetadata={calculateMetadata}
    />
  );
};
