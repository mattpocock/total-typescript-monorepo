export const THRESHOLD = -33;
export const SILENCE_DURATION = 0.8;
export const TRIM_VIDEO_PADDING = 0.3;

export const AUTO_EDITED_START_PADDING = 0;
export const AUTO_EDITED_END_PADDING = 0.08;
// The final padding applied to the auto-edited video
// to ensure it's not cut off at the end
export const AUTO_EDITED_VIDEO_FINAL_END_PADDING = 0.5;

export const MINIMUM_CLIP_LENGTH_IN_SECONDS = 1;
/**
 * When I press 'bad take' after I finish recording,
 * this is the number of frames to check after the end
 * for the bad take marker to DEFINITELY be a bad take.
 */
export const DEFINITELY_BAD_TAKE_PADDING = 2;

/**
 * If a bad take marker is more than this many seconds after
 * the end of a clip, we consider it unrelated to the clip
 * and ignore it.
 */
export const MAX_BAD_TAKE_DISTANCE = 5;

/**
 * The maximum number of ffmpeg processes that can run at once.
 */
export const FFMPEG_CONCURRENCY_LIMIT = 6;

/**
 * The maximum number of transcription processes that can run at once.
 */
export const TRANSCRIPTION_CONCURRENCY_LIMIT = 20;
