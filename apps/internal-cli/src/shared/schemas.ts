import { Schema } from "effect";

/**
 * Schema for video clips used by create-video-from-clips and send-clips-to-davinci-resolve commands
 */
export const clipsSchema = Schema.Array(
  Schema.Struct({
    startTime: Schema.Number,
    duration: Schema.Number,
    inputVideo: Schema.String,
    beatType: Schema.Union(Schema.Literal("none"), Schema.Literal("long")),
  }),
);
