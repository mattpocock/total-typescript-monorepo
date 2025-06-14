import { z } from "zod";

export const schema = z.object({
  subtitles: z.array(
    z.object({
      startFrame: z.number(),
      endFrame: z.number(),
      text: z.string(),
    }),
  ),
  ctaDurationInFrames: z.number(),
  cta: z.string().describe("typescript or ai"),
  durationInFrames: z.number(),
});
