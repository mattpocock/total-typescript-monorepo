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

  // Note: This test uses default services and may call real implementations
  // TODO: Implement proper service mocking when needed for isolation
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
    Effect.provide(FFmpegCommandsService.Default),
    Effect.provide(TranscriptStorageService.Default),
    Effect.provide(AskQuestionService.Default),
    Effect.provide(ReadStreamService.Default),
    Effect.provide(WorkflowsService.Default),
    Effect.withConfigProvider(mockConfig),
    Effect.runPromise
  );

  expect(result).toBe("/path/to/shorts/Test.mp4");
});

it("should create auto edited video workflow with no subtitles", async () => {
  const writeFileString = vi.fn().mockReturnValue(Effect.succeed(undefined));
  const rename = vi.fn().mockReturnValue(Effect.succeed(undefined));
  const remove = vi.fn().mockReturnValue(Effect.succeed(undefined));
  const exists = vi.fn().mockReturnValue(Effect.succeed(false));

  // Note: This test uses default services and may call real implementations
  // TODO: Implement proper service mocking when needed for isolation
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
    Effect.provide(FFmpegCommandsService.Default),
    Effect.provide(TranscriptStorageService.Default),
    Effect.provide(AskQuestionService.Default),
    Effect.provide(ReadStreamService.Default),
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

  // Note: This test uses default services and may call real implementations
  // TODO: Implement proper service mocking when needed for isolation
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
    Effect.provide(FFmpegCommandsService.Default),
    Effect.provide(TranscriptStorageService.Default),
    Effect.provide(AskQuestionService.Default),
    Effect.provide(ReadStreamService.Default),
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
