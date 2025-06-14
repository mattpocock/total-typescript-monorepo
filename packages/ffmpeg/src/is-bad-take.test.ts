import { describe, it, expect } from "vitest";
import { isBadTake } from "./chapter-extraction.js";
import {
  DEFINITELY_BAD_TAKE_PADDING,
  MAX_BAD_TAKE_DISTANCE,
} from "./constants.js";

describe("isBadTake", () => {
  const fps = 60;
  const baseClip = {
    startFrame: 100,
    endFrame: 200,
  };

  const clips = [
    baseClip,
    {
      startFrame: 500, // Much further away (5 seconds at 60fps)
      endFrame: 600,
    },
  ];

  it("should return definitely-bad when bad take marker is within clip", () => {
    const badTakeMarkers = [
      {
        frame: 120, // Within the clip (between 100 and 200)
      },
    ];

    const result = isBadTake(baseClip, badTakeMarkers, 0, clips, fps);
    expect(result).toBe("definitely-bad");
  });

  it("should return definitely-bad when bad take marker is within DEFINITELY_BAD_TAKE_PADDING of end", () => {
    const paddingInFrames = Math.floor(DEFINITELY_BAD_TAKE_PADDING * fps);
    const badTakeMarkers = [
      {
        frame: baseClip.endFrame + Math.floor(paddingInFrames / 2), // Halfway through the padding
      },
    ];

    const result = isBadTake(baseClip, badTakeMarkers, 0, clips, fps);
    expect(result).toBe("definitely-bad");
  });

  it("should return good when bad take marker is beyond MAX_BAD_TAKE_DISTANCE", () => {
    const maxDistanceInFrames = Math.floor(MAX_BAD_TAKE_DISTANCE * fps);
    const badTakeMarkers = [
      {
        frame: baseClip.endFrame + maxDistanceInFrames + 1, // Just beyond max distance
      },
    ];

    const result = isBadTake(baseClip, badTakeMarkers, 0, clips, fps);
    expect(result).toBe("good");
  });

  it("should return maybe-bad when bad take marker is between clips", () => {
    const paddingInFrames = Math.floor(DEFINITELY_BAD_TAKE_PADDING * fps);
    const badTakeMarkers = [
      {
        frame: baseClip.endFrame + paddingInFrames + 10, // Beyond padding but still between clips
      },
    ];

    const result = isBadTake(baseClip, badTakeMarkers, 0, clips, fps);
    expect(result).toBe("maybe-bad");
  });

  it("should return maybe-bad for last clip when bad take marker is after it", () => {
    const lastClip = clips[1]!;
    const paddingInFrames = Math.floor(DEFINITELY_BAD_TAKE_PADDING * fps);
    const badTakeMarkers = [
      {
        frame: lastClip.endFrame + paddingInFrames + 10, // Beyond padding but within max distance
      },
    ];

    const result = isBadTake(lastClip, badTakeMarkers, 1, clips, fps);
    expect(result).toBe("maybe-bad");
  });

  it("should return good when no bad take markers are present", () => {
    const result = isBadTake(baseClip, [], 0, clips, fps);
    expect(result).toBe("good");
  });
});
