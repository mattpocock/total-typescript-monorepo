import { describe, it, expect } from "vitest";
import { getClipsOfSpeakingFromFFmpeg } from "./getSpeakingClips.js";
import { readFileSync } from "fs";
import { join } from "path";

const FIXTURES_DIR = join(import.meta.dirname, "__fixtures__");

describe("getClipsOfSpeakingFromFFmpegNew", () => {
  it("should correctly parse FFmpeg output and return speaking clips", () => {
    const fixture = readFileSync(
      join(FIXTURES_DIR, "ffmpeg-output-1.txt"),
      "utf-8"
    );

    const opts = {
      startPadding: 0.5,
      endPadding: 0.5,
      fps: 60,
    };

    const result = getClipsOfSpeakingFromFFmpeg(fixture, opts);

    // Basic validation of the result
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);

    // Check the structure of the first clip
    const firstClip = result[0]!;
    expect(firstClip).toHaveProperty("startFrame");
    expect(firstClip).toHaveProperty("endFrame");
    expect(firstClip).toHaveProperty("startTime");
    expect(firstClip).toHaveProperty("endTime");
    expect(firstClip).toHaveProperty("silenceEnd");
    expect(firstClip).toHaveProperty("duration");

    // Check that the values are numbers
    expect(typeof firstClip.startFrame).toBe("number");
    expect(typeof firstClip.endFrame).toBe("number");
    expect(typeof firstClip.startTime).toBe("number");
    expect(typeof firstClip.endTime).toBe("number");
    expect(typeof firstClip.silenceEnd).toBe("number");
    expect(typeof firstClip.duration).toBe("number");

    // Check that the padding is applied correctly
    expect(firstClip.startTime).toBe(firstClip.silenceEnd - opts.startPadding);
    expect(firstClip.endTime).toBe(
      firstClip.silenceEnd + firstClip.duration + opts.endPadding
    );
  });
});
