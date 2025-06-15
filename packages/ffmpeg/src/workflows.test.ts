import { expect, it, vi } from "vitest";
import { createAutoEditedVideoWorkflow } from "./workflows.js";
import { okAsync } from "neverthrow";
import type { AbsolutePath } from "@total-typescript/shared";
import { fromPartial } from "@total-typescript/shoehorn";
import {
  AUTO_EDITED_END_PADDING,
  AUTO_EDITED_VIDEO_FINAL_END_PADDING,
} from "./constants.js";

it("createAutoEditedVideoWorkflow with subtitles and no dry run should work", async () => {
  const writeFile = vi.fn();
  const rename = vi.fn();
  const unlink = vi.fn();
  const rm = vi.fn();

  const createClip = vi.fn();
  const concatenateClips = vi.fn().mockReturnValue(okAsync({}));
  const extractAudioFromVideo = vi.fn().mockReturnValue(okAsync({}));
  const renderRemotion = vi.fn().mockReturnValue(okAsync({}));
  const overlaySubtitles = vi.fn().mockReturnValue(okAsync({}));

  const result = await createAutoEditedVideoWorkflow({
    exportDirectory: "/path/to/export",
    shortsExportDirectory: "/path/to/shorts",
    getLatestVideo: () =>
      okAsync("/path/latest-video-filename.mp4" as AbsolutePath),
    promptForFilename: () => Promise.resolve("Test"),
    validateFilename: () => ({ isValid: true }),
    subtitles: true,
    dryRun: false,
    ctx: fromPartial({
      transcriptionDirectory: "/path/to/transcriptions",
      ffmpeg: {
        getFPS: () => okAsync(60),
        detectSilence: () =>
          okAsync({
            // Speaking clips are 3-6, 10-15
            stdout: `[silencedetect @ 0x55791a4e4680] silence_start: 0d=N/A
  [silencedetect @ 0x55791a4e4680] silence_end: 3.0 | silence_duration: 3.00
  [silencedetect @ 0x55791a4e4680] silence_start: 6.0
  [silencedetect @ 0x55791a4e4680] silence_end: 10.0 | silence_duration: 4.0
  [silencedetect @ 0x55791a4e4680] silence_start: 15.0
  [silencedetect @ 0x55791a4e4680] silence_end: 19.0 | silence_duration: 4.0`,
          }),
        getChapters: () =>
          okAsync({
            chapters: [],
          }),
        concatenateClips,
        createClip,
        extractAudioFromVideo,
        createSubtitleFromAudio: () => [
          {
            start: 0,
            end: 3,
            text: " Test",
          },
          {
            start: 3,
            end: 8,
            text: "Test",
          },
        ],
        figureOutWhichCTAToShow: () => "ai",
        renderRemotion,
        overlaySubtitles,
      },
      fs: {
        writeFile,
        rename,
        unlink,
        rm,
      },
    }),
  });

  expect(result.isOk()).toBe(true);

  /**
   * Expect that the transcription was written to the transcription directory.
   */
  expect(writeFile).toHaveBeenCalledWith(
    expect.stringContaining("latest-video-filename.txt"),
    "TestTest"
  );

  /**
   * Expect that a meta.json file should have been
   * created in the remotion directory.
   */
  expect(writeFile).toHaveBeenCalledWith(
    expect.stringContaining("meta.json"),
    expect.any(String)
  );

  const metaJson = writeFile.mock.calls.find(([path]) =>
    path.endsWith("meta.json")
  )![1];

  const metaFile = JSON.parse(metaJson);

  /**
   * The duration of the video should be the sum of the durations of the clips,
   * plus the padding for the end of the video and the padding
   * for the end of the last clip.
   */
  expect(metaFile.durationInFrames).toEqual(
    (8 + AUTO_EDITED_END_PADDING + AUTO_EDITED_VIDEO_FINAL_END_PADDING) * 60
  );

  /**
   * Expect that the CTA is set to "ai".
   */
  expect(metaFile.cta).toEqual("ai");

  /**
   * The CTA duration should be the duration of the first clip,
   * plus padding.
   */
  expect(metaFile.ctaDurationInFrames).toEqual(
    (3 + AUTO_EDITED_END_PADDING) * 60
  );

  /**
   * Expect that the subtitles are set to the correct
   * start and end frames.
   */
  expect(metaFile.subtitles).toMatchObject([
    {
      startFrame: 0,
      endFrame: 3 * 60,
    },
    {
      startFrame: 3 * 60,
      endFrame: 8 * 60,
    },
  ]);

  /**
   * The first clip should be 3 seconds long,
   * plus the padding for the end of the clip.
   */
  expect(createClip).toHaveBeenCalledWith(
    "/path/latest-video-filename.mp4",
    expect.stringContaining("clip-0.mp4"),
    3,
    3 + AUTO_EDITED_END_PADDING
  );

  /**
   * The second clip should be 2 seconds long,
   * plus the padding for the FINAL end of the clip.
   */
  expect(createClip).toHaveBeenCalledWith(
    "/path/latest-video-filename.mp4",
    expect.stringContaining("clip-1.mp4"),
    10,
    5 + AUTO_EDITED_VIDEO_FINAL_END_PADDING
  );

  /**
   * Concatenate clips should be called with Test.mp4 as
   * the output path.
   */
  expect(concatenateClips).toHaveBeenCalledWith(
    expect.stringContaining("concat.txt"),
    expect.stringContaining("Test.mp4")
  );

  /**
   * Expect that extractAudioFromVideo creates an mp3 file.
   */
  expect(extractAudioFromVideo).toHaveBeenCalledWith(
    expect.stringContaining("Test.mp4"),
    expect.stringContaining("Test.mp4.mp3")
  );

  /**
   * Expect that unlink is called with the mp3 file.
   */
  expect(unlink).toHaveBeenCalledWith(expect.stringContaining("Test.mp4.mp3"));

  /**
   * Expect that renderRemotion is used to create a video
   * called MyComp.mov.
   */
  expect(renderRemotion).toHaveBeenCalledWith(
    expect.stringContaining("MyComp.mov"),
    expect.any(String)
  );

  /**
   * Expect that overlaySubtitles is called with the
   * input path, the subtitles overlay path, and the
   * output path.
   */
  expect(overlaySubtitles).toHaveBeenCalledWith(
    expect.stringContaining("Test.mp4"),
    expect.stringContaining("MyComp.mov"),
    expect.stringContaining("Test-with-subtitles.mp4")
  );

  /**
   * Expect the file SHOULD have been moved to the shorts directory.
   */
  expect(rename).toHaveBeenCalledWith(
    expect.stringContaining("Test-with-subtitles.mp4"),
    expect.stringContaining("shorts/Test.mp4")
  );

  /**
   * Expect that the temporary directory should have been
   * removed.
   */
  expect(rm).toHaveBeenCalledWith(expect.stringContaining("tmp"), {
    recursive: true,
    force: true,
  });
});

it("createAutoEditedVideoWorkflow with no subtitles", async () => {
  const writeFile = vi.fn();
  const rename = vi.fn();
  const unlink = vi.fn();
  const rm = vi.fn();

  const createClip = vi.fn();
  const concatenateClips = vi.fn().mockReturnValue(okAsync({}));
  const extractAudioFromVideo = vi.fn().mockReturnValue(okAsync({}));
  const renderRemotion = vi.fn().mockReturnValue(okAsync({}));
  const overlaySubtitles = vi.fn().mockReturnValue(okAsync({}));

  const result = await createAutoEditedVideoWorkflow({
    exportDirectory: "/path/to/export",
    shortsExportDirectory: "/path/to/shorts",
    getLatestVideo: () =>
      okAsync("/path/latest-video-filename.mp4" as AbsolutePath),
    promptForFilename: () => Promise.resolve("Test"),
    validateFilename: () => ({ isValid: true }),
    subtitles: false,
    dryRun: false,
    ctx: fromPartial({
      transcriptionDirectory: "/path/to/transcriptions",
      ffmpeg: {
        getFPS: () => okAsync(60),
        detectSilence: () =>
          okAsync({
            // Speaking clips are 3-6, 10-12
            stdout: `[silencedetect @ 0x55791a4e4680] silence_start: 0d=N/A
  [silencedetect @ 0x55791a4e4680] silence_end: 3.0 | silence_duration: 3.00
  [silencedetect @ 0x55791a4e4680] silence_start: 6.0
  [silencedetect @ 0x55791a4e4680] silence_end: 10.0 | silence_duration: 4.0
  [silencedetect @ 0x55791a4e4680] silence_start: 12.0
  [silencedetect @ 0x55791a4e4680] silence_end: 16.0 | silence_duration: 4.0`,
          }),
        getChapters: () =>
          okAsync({
            chapters: [],
          }),
        concatenateClips,
        createClip,
        extractAudioFromVideo,
        createSubtitleFromAudio: () => [
          {
            start: 0,
            end: 3,
            text: "Test",
          },
          {
            start: 3,
            end: 5,
            text: "Test",
          },
        ],
        figureOutWhichCTAToShow: () => "ai",
        renderRemotion,
        overlaySubtitles,
      },
      fs: {
        writeFile,
        rename,
        unlink,
        rm,
      },
    }),
  });

  expect(result.isOk()).toBe(true);

  /**
   * Expect that the transcription was written to the
   * transcription directory, even though subtitles are
   * disabled.
   */
  expect(writeFile).toHaveBeenCalledWith(
    expect.stringContaining("latest-video-filename.txt"),
    "TestTest"
  );

  /**
   * An audio file should have been created.
   */
  expect(extractAudioFromVideo).toHaveBeenCalledWith(
    expect.stringContaining("Test.mp4"),
    expect.stringContaining("Test.mp4.mp3")
  );

  /**
   * Expect that renderRemotion and overlaySubtitles
   * should not have been called.
   */
  expect(renderRemotion).not.toHaveBeenCalled();
  expect(overlaySubtitles).not.toHaveBeenCalled();
});

it("createAutoEditedVideoWorkflow with dry run", async () => {
  const writeFile = vi.fn();
  const rename = vi.fn();
  const unlink = vi.fn();
  const rm = vi.fn();

  const createClip = vi.fn();
  const concatenateClips = vi.fn().mockReturnValue(okAsync({}));
  const extractAudioFromVideo = vi.fn().mockReturnValue(okAsync({}));
  const renderRemotion = vi.fn().mockReturnValue(okAsync({}));
  const overlaySubtitles = vi.fn().mockReturnValue(okAsync({}));

  const result = await createAutoEditedVideoWorkflow({
    exportDirectory: "/path/to/export",
    shortsExportDirectory: "/path/to/shorts",
    getLatestVideo: () =>
      okAsync("/path/latest-video-filename.mp4" as AbsolutePath),
    promptForFilename: () => Promise.resolve("Test"),
    validateFilename: () => ({ isValid: true }),
    subtitles: false,
    dryRun: true,
    ctx: fromPartial({
      transcriptionDirectory: "/path/to/transcriptions",

      ffmpeg: {
        getFPS: () => okAsync(60),
        detectSilence: () =>
          okAsync({
            // Speaking clips are 3-6, 10-12
            stdout: `[silencedetect @ 0x55791a4e4680] silence_start: 0d=N/A
  [silencedetect @ 0x55791a4e4680] silence_end: 3.0 | silence_duration: 3.00
  [silencedetect @ 0x55791a4e4680] silence_start: 6.0
  [silencedetect @ 0x55791a4e4680] silence_end: 10.0 | silence_duration: 4.0
  [silencedetect @ 0x55791a4e4680] silence_start: 12.0
  [silencedetect @ 0x55791a4e4680] silence_end: 16.0 | silence_duration: 4.0`,
          }),
        getChapters: () =>
          okAsync({
            chapters: [],
          }),
        concatenateClips,
        createClip,
        extractAudioFromVideo,
        createSubtitleFromAudio: () => [
          {
            start: 0,
            end: 3,
            text: "Test",
          },
          {
            start: 3,
            end: 5,
            text: "Test",
          },
        ],
        figureOutWhichCTAToShow: () => "ai",
        renderRemotion,
        overlaySubtitles,
      },
      fs: {
        writeFile,
        rename,
        unlink,
        rm,
      },
    }),
  });

  expect(result.isOk()).toBe(true);

  /**
   * Expect the file SHOULD NOT have been moved to the shorts directory.
   */
  expect(rename).not.toHaveBeenCalledWith(
    expect.any(String),
    expect.stringMatching("shorts")
  );
});
