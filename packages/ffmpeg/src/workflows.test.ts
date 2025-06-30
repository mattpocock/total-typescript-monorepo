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
