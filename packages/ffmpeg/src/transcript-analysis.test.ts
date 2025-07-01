import { FileSystem } from "@effect/platform";
import type { AbsolutePath } from "@total-typescript/shared";
import { Effect, Layer } from "effect";
import { expect, it, vi } from "vitest";
import { AIService } from "./services.js";
import {
  analyzeTranscriptForLinks,
  TranscriptAnalysisError,
} from "./transcript-analysis.js";

it("Should analyze transcript and return link requests", async () => {
  const mockAskForLinks = vi
    .fn()
    .mockReturnValue(
      Effect.succeed(["Documentation link", "TypeScript handbook"])
    );

  const mockReadFileString = vi
    .fn()
    .mockReturnValue(
      Effect.succeed("This is a test transcript about TypeScript")
    );

  const aiLayer = Layer.succeed(AIService, {
    askForLinks: mockAskForLinks,
    articleFromTranscript: vi.fn(),
    titleFromTranscript: vi.fn(),
  } as any);

  const fsLayer = Layer.succeed(FileSystem.FileSystem, {
    readFileString: mockReadFileString,
  } as any);

  const result = await analyzeTranscriptForLinks({
    transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
    originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
  }).pipe(Effect.provide(Layer.merge(aiLayer, fsLayer)), Effect.runPromise);

  expect(result).toEqual(["Documentation link", "TypeScript handbook"]);
  expect(mockAskForLinks).toHaveBeenCalledWith({
    transcript: "This is a test transcript about TypeScript",
  });
  expect(mockReadFileString).toHaveBeenCalledWith("/path/to/transcript.txt");
});

it("Should fail when transcript is empty", async () => {
  const mockAskForLinks = vi.fn();
  const mockReadFileString = vi
    .fn()
    .mockReturnValue(Effect.succeed("   \n  \t  "));

  const aiLayer = Layer.succeed(AIService, {
    askForLinks: mockAskForLinks,
    articleFromTranscript: vi.fn(),
    titleFromTranscript: vi.fn(),
  } as any);

  const fsLayer = Layer.succeed(FileSystem.FileSystem, {
    readFileString: mockReadFileString,
  } as any);

  const result = await analyzeTranscriptForLinks({
    transcriptPath: "/path/to/empty.txt" as AbsolutePath,
    originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
  }).pipe(
    Effect.provide(Layer.merge(aiLayer, fsLayer)),
    Effect.flip,
    Effect.runPromise
  );

  expect(result).toBeInstanceOf(TranscriptAnalysisError);
  expect((result as any).transcriptPath).toBe("/path/to/empty.txt");
  expect(mockAskForLinks).not.toHaveBeenCalled();
});
