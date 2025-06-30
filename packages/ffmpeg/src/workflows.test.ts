import { ConfigProvider, Effect } from "effect";
import { expect, it, vi } from "vitest";
import { WorkflowsService, FileAlreadyExistsError } from "./workflows.js";
import type { AbsolutePath } from "@total-typescript/shared";
import { FileSystem } from "@effect/platform";
import { FFmpegCommandsService } from "./ffmpeg-commands.js";
import {
  AskQuestionService,
  ReadStreamService,
  TranscriptStorageService,
} from "./services.js";

const mockConfig = ConfigProvider.fromJson({
  EXPORT_DIRECTORY: "/path/to/export",
  SHORTS_EXPORT_DIRECTORY: "/path/to/shorts",
  TRANSCRIPTION_DIRECTORY: "/path/to/transcriptions",
  OBS_OUTPUT_DIRECTORY: "/path/to/obs",
  OPENAI_API_KEY: "test-api-key",
  AUDIO_FILE_EXTENSION: ".mp3",
});


it("should return an error if the filename already exists in the shorts directory", async () => {
  const exists = vi.fn().mockImplementation((path: string) => {
    if (path.includes("shorts")) {
      return Effect.succeed(true);
    }
    return Effect.succeed(false);
  });

  const error = await Effect.gen(function* () {
    const workflows = yield* WorkflowsService;
    return yield* workflows.createAutoEditedVideoWorkflow({
      inputVideo: "/path/latest-video-filename.mp4" as AbsolutePath,
      outputFilename: "Test",
      subtitles: false,
      dryRun: false,
    });
  }).pipe(
    Effect.provide(
      FileSystem.layerNoop({
        exists,
        writeFileString: vi.fn().mockReturnValue(Effect.succeed(undefined)),
        rename: vi.fn().mockReturnValue(Effect.succeed(undefined)),
        remove: vi.fn().mockReturnValue(Effect.succeed(undefined)),
        readDirectory: vi.fn().mockReturnValue(Effect.succeed([])),
        stat: vi.fn().mockReturnValue(Effect.succeed({ mtime: new Date() })),
      })
    ),
    Effect.provide(FFmpegCommandsService.Default),
    Effect.provide(TranscriptStorageService.Default),
    Effect.provide(AskQuestionService.Default),
    Effect.provide(ReadStreamService.Default),
    Effect.provide(WorkflowsService.Default),
    Effect.withConfigProvider(mockConfig),
    Effect.flip,
    Effect.runPromise
  );

  expect(error).toBeInstanceOf(FileAlreadyExistsError);
  expect(error.message).toBe("File already exists in shorts directory");
  expect(exists).toHaveBeenCalledWith("/path/to/shorts/Test.mp4");
});

it("should create auto edited video workflow with subtitles and no dry run", async () => {
  const writeFileString = vi.fn().mockReturnValue(Effect.succeed(undefined));
  const rename = vi.fn().mockReturnValue(Effect.succeed(undefined));
  const remove = vi.fn().mockReturnValue(Effect.succeed(undefined));
  const exists = vi.fn().mockReturnValue(Effect.succeed(false));

  const mockFFmpegService = {
    createSubtitleFromAudio: vi.fn().mockReturnValue(
      Effect.succeed({
        segments: [
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
        words: [],
      })
    ),
    transcribeAudio: vi.fn().mockReturnValue(Effect.succeed("Test audio")),
    getFPS: vi.fn().mockReturnValue(Effect.succeed(60)),
    getVideoDuration: vi.fn().mockReturnValue(Effect.succeed(120)),
    getChapters: vi.fn().mockReturnValue(
      Effect.succeed({
        chapters: [],
      })
    ),
    encodeVideo: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    formatFloatForFFmpeg: vi.fn().mockReturnValue(Effect.succeed("123.456")),
    trimVideo: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    convertToWav: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    normalizeAudio: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    extractAudioFromVideo: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    createClip: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    concatenateClips: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    overlaySubtitles: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    detectSilence: vi.fn().mockReturnValue(
      Effect.succeed({
        stdout: `[silencedetect @ 0x55791a4e4680] silence_start: 0d=N/A
[silencedetect @ 0x55791a4e4680] silence_end: 3.0 | silence_duration: 3.00
[silencedetect @ 0x55791a4e4680] silence_start: 6.0
[silencedetect @ 0x55791a4e4680] silence_end: 10.0 | silence_duration: 4.0
[silencedetect @ 0x55791a4e4680] silence_start: 15.0
[silencedetect @ 0x55791a4e4680] silence_end: 19.0 | silence_duration: 4.0`,
      })
    ),
    figureOutWhichCTAToShow: vi.fn().mockReturnValue(Effect.succeed("ai")),
    renderRemotion: vi.fn().mockReturnValue(Effect.succeed(undefined)),
  };

  const mockTranscriptService = {
    storeTranscript: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    getTranscripts: vi.fn().mockReturnValue(Effect.succeed([])),
    getOriginalVideoPathFromTranscript: vi.fn().mockReturnValue(
      Effect.succeed("/path/to/original.mp4" as AbsolutePath)
    ),
  };

  const mockReadStreamService = {
    createReadStream: vi.fn().mockReturnValue(Effect.succeed(null)),
  };

  const mockAskQuestionService = {
    askQuestion: vi.fn().mockReturnValue(Effect.succeed("Test answer")),
    select: vi.fn().mockReturnValue(Effect.succeed("Test selection")),
  };

  const result = await Effect.gen(function* () {
    const workflows = yield* WorkflowsService;
    return yield* workflows.createAutoEditedVideoWorkflow({
      inputVideo: "/path/latest-video-filename.mp4" as AbsolutePath,
      outputFilename: "Test",
      subtitles: true,
      dryRun: false,
    });
  }).pipe(
    Effect.provide(
      FileSystem.layerNoop({
        writeFileString,
        rename,
        remove,
        exists,
        readDirectory: vi.fn().mockReturnValue(Effect.succeed([])),
        stat: vi.fn().mockReturnValue(Effect.succeed({ mtime: new Date() })),
      })
    ),
    Effect.provideService(FFmpegCommandsService, mockFFmpegService),
    Effect.provideService(TranscriptStorageService, mockTranscriptService),
    Effect.provideService(ReadStreamService, mockReadStreamService),
    Effect.provideService(AskQuestionService, mockAskQuestionService),
    Effect.provide(WorkflowsService.Default),
    Effect.withConfigProvider(mockConfig),
    Effect.runPromise
  );

  expect(result).toBe("/path/to/shorts/Test.mp4");

  /**
   * Expect that a meta.json file should have been
   * created in the remotion directory.
   */
  expect(writeFileString).toHaveBeenCalledWith(
    expect.stringContaining("meta.json"),
    expect.any(String)
  );

  const metaJson = writeFileString.mock.calls.find(([path]) =>
    path.endsWith("meta.json")
  )![1];

  const metaFile = JSON.parse(metaJson);

  /**
   * Expect that the CTA is set to "ai".
   */
  expect(metaFile.cta).toEqual("ai");

  /**
   * Expect that the file SHOULD have been moved to the shorts directory.
   */
  expect(rename).toHaveBeenCalledWith(
    expect.stringContaining("Test-with-subtitles.mp4"),
    expect.stringContaining("shorts/Test.mp4")
  );
});

it("should create auto edited video workflow with no subtitles", async () => {
  const writeFileString = vi.fn().mockReturnValue(Effect.succeed(undefined));
  const rename = vi.fn().mockReturnValue(Effect.succeed(undefined));
  const remove = vi.fn().mockReturnValue(Effect.succeed(undefined));
  const exists = vi.fn().mockReturnValue(Effect.succeed(false));

  const mockFFmpegService = {
    createSubtitleFromAudio: vi.fn().mockReturnValue(
      Effect.succeed({
        segments: [
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
        words: [],
      })
    ),
    transcribeAudio: vi.fn().mockReturnValue(Effect.succeed("Test audio")),
    getFPS: vi.fn().mockReturnValue(Effect.succeed(60)),
    getVideoDuration: vi.fn().mockReturnValue(Effect.succeed(120)),
    getChapters: vi.fn().mockReturnValue(
      Effect.succeed({
        chapters: [],
      })
    ),
    encodeVideo: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    formatFloatForFFmpeg: vi.fn().mockReturnValue(Effect.succeed("123.456")),
    trimVideo: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    convertToWav: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    normalizeAudio: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    extractAudioFromVideo: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    createClip: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    concatenateClips: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    overlaySubtitles: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    detectSilence: vi.fn().mockReturnValue(
      Effect.succeed({
        stdout: `[silencedetect @ 0x55791a4e4680] silence_start: 0d=N/A
[silencedetect @ 0x55791a4e4680] silence_end: 3.0 | silence_duration: 3.00
[silencedetect @ 0x55791a4e4680] silence_start: 6.0
[silencedetect @ 0x55791a4e4680] silence_end: 10.0 | silence_duration: 4.0
[silencedetect @ 0x55791a4e4680] silence_start: 12.0
[silencedetect @ 0x55791a4e4680] silence_end: 16.0 | silence_duration: 4.0`,
      })
    ),
    figureOutWhichCTAToShow: vi.fn().mockReturnValue(Effect.succeed("ai")),
    renderRemotion: vi.fn().mockReturnValue(Effect.succeed(undefined)),
  };

  const mockTranscriptService = {
    storeTranscript: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    getTranscripts: vi.fn().mockReturnValue(Effect.succeed([])),
    getOriginalVideoPathFromTranscript: vi.fn().mockReturnValue(
      Effect.succeed("/path/to/original.mp4" as AbsolutePath)
    ),
  };

  const mockReadStreamService = {
    createReadStream: vi.fn().mockReturnValue(Effect.succeed(null)),
  };

  const mockAskQuestionService = {
    askQuestion: vi.fn().mockReturnValue(Effect.succeed("Test answer")),
    select: vi.fn().mockReturnValue(Effect.succeed("Test selection")),
  };

  const result = await Effect.gen(function* () {
    const workflows = yield* WorkflowsService;
    return yield* workflows.createAutoEditedVideoWorkflow({
      inputVideo: "/path/latest-video-filename.mp4" as AbsolutePath,
      outputFilename: "Test",
      subtitles: false,
      dryRun: false,
    });
  }).pipe(
    Effect.provide(
      FileSystem.layerNoop({
        writeFileString,
        rename,
        remove,
        exists,
        readDirectory: vi.fn().mockReturnValue(Effect.succeed([])),
        stat: vi.fn().mockReturnValue(Effect.succeed({ mtime: new Date() })),
      })
    ),
    Effect.provideService(FFmpegCommandsService, mockFFmpegService),
    Effect.provideService(TranscriptStorageService, mockTranscriptService),
    Effect.provideService(ReadStreamService, mockReadStreamService),
    Effect.provideService(AskQuestionService, mockAskQuestionService),
    Effect.provide(WorkflowsService.Default),
    Effect.withConfigProvider(mockConfig),
    Effect.runPromise
  );

  expect(result).toBe("/path/to/shorts/Test.mp4");
});

it("should create auto edited video workflow with dry run", async () => {
  const writeFileString = vi.fn().mockReturnValue(Effect.succeed(undefined));
  const rename = vi.fn().mockReturnValue(Effect.succeed(undefined));
  const remove = vi.fn().mockReturnValue(Effect.succeed(undefined));
  const exists = vi.fn().mockReturnValue(Effect.succeed(false));

  const mockFFmpegService = {
    createSubtitleFromAudio: vi.fn().mockReturnValue(
      Effect.succeed({
        segments: [
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
        words: [],
      })
    ),
    transcribeAudio: vi.fn().mockReturnValue(Effect.succeed("Test audio")),
    getFPS: vi.fn().mockReturnValue(Effect.succeed(60)),
    getVideoDuration: vi.fn().mockReturnValue(Effect.succeed(120)),
    getChapters: vi.fn().mockReturnValue(
      Effect.succeed({
        chapters: [],
      })
    ),
    encodeVideo: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    formatFloatForFFmpeg: vi.fn().mockReturnValue(Effect.succeed("123.456")),
    trimVideo: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    convertToWav: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    normalizeAudio: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    extractAudioFromVideo: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    createClip: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    concatenateClips: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    overlaySubtitles: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    detectSilence: vi.fn().mockReturnValue(
      Effect.succeed({
        stdout: `[silencedetect @ 0x55791a4e4680] silence_start: 0d=N/A
[silencedetect @ 0x55791a4e4680] silence_end: 3.0 | silence_duration: 3.00
[silencedetect @ 0x55791a4e4680] silence_start: 6.0
[silencedetect @ 0x55791a4e4680] silence_end: 10.0 | silence_duration: 4.0
[silencedetect @ 0x55791a4e4680] silence_start: 12.0
[silencedetect @ 0x55791a4e4680] silence_end: 16.0 | silence_duration: 4.0`,
      })
    ),
    figureOutWhichCTAToShow: vi.fn().mockReturnValue(Effect.succeed("ai")),
    renderRemotion: vi.fn().mockReturnValue(Effect.succeed(undefined)),
  };

  const mockTranscriptService = {
    storeTranscript: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    getTranscripts: vi.fn().mockReturnValue(Effect.succeed([])),
    getOriginalVideoPathFromTranscript: vi.fn().mockReturnValue(
      Effect.succeed("/path/to/original.mp4" as AbsolutePath)
    ),
  };

  const mockReadStreamService = {
    createReadStream: vi.fn().mockReturnValue(Effect.succeed(null)),
  };

  const mockAskQuestionService = {
    askQuestion: vi.fn().mockReturnValue(Effect.succeed("Test answer")),
    select: vi.fn().mockReturnValue(Effect.succeed("Test selection")),
  };

  const result = await Effect.gen(function* () {
    const workflows = yield* WorkflowsService;
    return yield* workflows.createAutoEditedVideoWorkflow({
      inputVideo: "/path/latest-video-filename.mp4" as AbsolutePath,
      outputFilename: "Test",
      subtitles: false,
      dryRun: true,
    });
  }).pipe(
    Effect.provide(
      FileSystem.layerNoop({
        writeFileString,
        rename,
        remove,
        exists,
        readDirectory: vi.fn().mockReturnValue(Effect.succeed([])),
        stat: vi.fn().mockReturnValue(Effect.succeed({ mtime: new Date() })),
      })
    ),
    Effect.provideService(FFmpegCommandsService, mockFFmpegService),
    Effect.provideService(TranscriptStorageService, mockTranscriptService),
    Effect.provideService(ReadStreamService, mockReadStreamService),
    Effect.provideService(AskQuestionService, mockAskQuestionService),
    Effect.provide(WorkflowsService.Default),
    Effect.withConfigProvider(mockConfig),
    Effect.runPromise
  );

  expect(result).toBe("/path/to/export/Test.mp4");

  /**
   * Expect the file SHOULD NOT have been moved to the shorts directory.
   */
  expect(rename).not.toHaveBeenCalledWith(
    expect.any(String),
    expect.stringMatching("shorts")
  );
});

it("should return an error if the filename already exists in the export directory", async () => {
  const exists = vi.fn().mockImplementation((path: string) => {
    if (path.includes("export") && !path.includes("shorts")) {
      return Effect.succeed(true);
    }
    return Effect.succeed(false);
  });

  const error = await Effect.gen(function* () {
    const workflows = yield* WorkflowsService;
    return yield* workflows.createAutoEditedVideoWorkflow({
      inputVideo: "/path/latest-video-filename.mp4" as AbsolutePath,
      outputFilename: "Test",
      subtitles: false,
      dryRun: false,
    });
  }).pipe(
    Effect.provide(
      FileSystem.layerNoop({
        exists,
        writeFileString: vi.fn().mockReturnValue(Effect.succeed(undefined)),
        rename: vi.fn().mockReturnValue(Effect.succeed(undefined)),
        remove: vi.fn().mockReturnValue(Effect.succeed(undefined)),
        readDirectory: vi.fn().mockReturnValue(Effect.succeed([])),
        stat: vi.fn().mockReturnValue(Effect.succeed({ mtime: new Date() })),
      })
    ),
    Effect.provide(FFmpegCommandsService.Default),
    Effect.provide(TranscriptStorageService.Default),
    Effect.provide(AskQuestionService.Default),
    Effect.provide(ReadStreamService.Default),
    Effect.provide(WorkflowsService.Default),
    Effect.withConfigProvider(mockConfig),
    Effect.flip,
    Effect.runPromise
  );

  expect(error).toBeInstanceOf(FileAlreadyExistsError);
  expect(error.message).toBe("File already exists in export directory");
  expect(exists).toHaveBeenCalledWith("/path/to/export/Test.mp4");
});
