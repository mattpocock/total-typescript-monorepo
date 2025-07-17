import { getValueInFrames } from "../silence-detection.js";

export type RawVideoMetadata = {
  id: string;
  /**
   * Input video path
   *
   * Relative to the base of the raw-videos directory
   */
  videoPath: string;
  clips: RawVideoSpeakingClip[];
  fps: number;
  resolution: {
    widthInPixels: number;
    heightInPixels: number;
  };
};

export type RawVideoSpeakingClip = {
  readonly id: string;
  /**
   * The path to the video file
   */
  videoPath: string;
  /**
   * The start time of the speaking clip in seconds
   */
  startTimeInSeconds: number;
  /**
   * The end time of the speaking clip in seconds
   */
  endTimeInSeconds: number;
  /**
   * The transcription of the speaking clip
   */
  transcript: string;
  /**
   * The timestamp at which the speaking clip was deleted
   */
  deleted: boolean;
};

export class RawVideoMetadataDTO {
  clips: RawVideoSpeakingClipDTO[];
  metadata: RawVideoMetadata;
  constructor(metadata: RawVideoMetadata) {
    this.clips = metadata.clips.map((clip) => {
      return new RawVideoSpeakingClipDTO(clip, { fps: metadata.fps });
    });
    this.metadata = metadata;
  }
}

export class RawVideoSpeakingClipDTO {
  clip: RawVideoSpeakingClip;
  private opts: { fps: number };
  constructor(clip: RawVideoSpeakingClip, opts: { fps: number }) {
    this.clip = clip;
    this.opts = opts;
  }

  get durationInSeconds() {
    return this.clip.endTimeInSeconds - this.clip.startTimeInSeconds;
  }

  get durationInFrames() {
    return getValueInFrames(this.durationInSeconds, {
      fps: this.opts.fps,
      bias: "floor",
    });
  }

  get startTimeInFrames() {
    return getValueInFrames(this.clip.startTimeInSeconds, {
      fps: this.opts.fps,
      bias: "ceil",
    });
  }

  get endTimeInFrames() {
    return getValueInFrames(this.clip.endTimeInSeconds, {
      fps: this.opts.fps,
      bias: "floor",
    });
  }
}
