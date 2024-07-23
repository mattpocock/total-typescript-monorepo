import { z } from "zod";

export type Meta = z.output<typeof metaSchema>;

const metaSchema = z.object({
  width: z
    .number()
    .optional()
    .describe("Width of the video."),
  height: z
    .number()
    .optional()
    .describe("Height of the video."),
  durations: z
    .array(z.number())
    .optional()
    .describe("Durations in ms of each slide."),
  music: z
    .boolean()
    .optional()
    .describe(
      "Whether to play music. Overridden by musicFullVolume if present.",
    ),
  musicFullVolume: z
    .boolean()
    .optional()
    .describe("Whether to play music at full volume."),
  slideDuration: z
    .number()
    .optional()
    .describe(
      "Duration of each slide. Overridden by durations if present.",
    ),
});

export let meta: Meta;

try {
  meta = metaSchema.parse(
    require("./meta.local.json"),
  );
} catch (e) {
  meta = {};
}
