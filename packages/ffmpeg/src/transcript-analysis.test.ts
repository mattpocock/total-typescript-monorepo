// @ts-nocheck

import type { AbsolutePath } from "@total-typescript/shared";
import { Effect } from "effect";
import { expect, it, vi } from "vitest";
import { AIService } from "./services.js";
import {
  analyzeTranscriptForLinks,
  TranscriptAnalysisError,
  TranscriptReadError,
} from "./transcript-analysis.js";
import { FileSystem } from "@effect/platform";

it("Should analyze transcript and return link requests", async () => {
  const mockAskForLinks = vi
    .fn()
    .mockReturnValue(
      Effect.succeed(["Documentation link", "TypeScript handbook"])
    );

  const mockReadFileString = vi
    .fn()
    .mockReturnValue(Effect.succeed("This is a test transcript about TypeScript"));

  const result = await analyzeTranscriptForLinks({
    transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
    originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
  }).pipe(
    Effect.provideService(AIService, {
      askForLinks: mockAskForLinks,
      articleFromTranscript: vi.fn(),
      titleFromTranscript: vi.fn(),
    }),
    Effect.provideService(FileSystem.FileSystem, {
      readFileString: mockReadFileString,
    }),
    Effect.runPromise
  );

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

  const result = await analyzeTranscriptForLinks({
    transcriptPath: "/path/to/empty.txt" as AbsolutePath,
    originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
  }).pipe(
    Effect.provideService(AIService, {
      askForLinks: mockAskForLinks,
      articleFromTranscript: vi.fn(),
      titleFromTranscript: vi.fn(),
    }),
    Effect.provideService(FileSystem.FileSystem, {
      readFileString: mockReadFileString,
    }),
    Effect.flip
  );

  expect(result).toBeInstanceOf(TranscriptAnalysisError);
  expect(result.transcriptPath).toBe("/path/to/empty.txt");
  expect(mockAskForLinks).not.toHaveBeenCalled();
});

it("Should handle file read errors", async () => {
  const mockAskForLinks = vi.fn();
  const fileError = new Error("File not found");
  const mockReadFileString = vi
    .fn()
    .mockReturnValue(Effect.fail(fileError));

  const result = await analyzeTranscriptForLinks({
    transcriptPath: "/path/to/missing.txt" as AbsolutePath,
    originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
  }).pipe(
    Effect.provideService(AIService, {
      askForLinks: mockAskForLinks,
      articleFromTranscript: vi.fn(),
      titleFromTranscript: vi.fn(),
    }),
    Effect.provideService(FileSystem.FileSystem, {
      readFileString: mockReadFileString,
    }),
    Effect.flip
  );

  expect(result).toBeInstanceOf(TranscriptReadError);
  expect(result.transcriptPath).toBe("/path/to/missing.txt");
  expect(result.cause).toBe(fileError);
  expect(mockAskForLinks).not.toHaveBeenCalled();
});

it("Should handle AI service failures", async () => {
  const aiError = new Error("AI service unavailable");
  const mockAskForLinks = vi
    .fn()
    .mockReturnValue(Effect.fail(aiError));

  const mockReadFileString = vi
    .fn()
    .mockReturnValue(Effect.succeed("Valid transcript content"));

  const result = await analyzeTranscriptForLinks({
    transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
    originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
  }).pipe(
    Effect.provideService(AIService, {
      askForLinks: mockAskForLinks,
      articleFromTranscript: vi.fn(),
      titleFromTranscript: vi.fn(),
    }),
    Effect.provideService(FileSystem.FileSystem, {
      readFileString: mockReadFileString,
    }),
    Effect.flip
  );

  expect(result).toBeInstanceOf(TranscriptAnalysisError);
  expect(result.transcriptPath).toBe("/path/to/transcript.txt");
  expect(result.cause).toBe(aiError);
});

it("Should handle undefined response from AI service", async () => {
  const mockAskForLinks = vi
    .fn()
    .mockReturnValue(Effect.succeed(undefined));

  const mockReadFileString = vi
    .fn()
    .mockReturnValue(Effect.succeed("Valid transcript content"));

  const result = await analyzeTranscriptForLinks({
    transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
    originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
  }).pipe(
    Effect.provideService(AIService, {
      askForLinks: mockAskForLinks,
      articleFromTranscript: vi.fn(),
      titleFromTranscript: vi.fn(),
    }),
    Effect.provideService(FileSystem.FileSystem, {
      readFileString: mockReadFileString,
    }),
    Effect.runPromise
  );

  expect(result).toEqual([]);
});

it("Should handle null response from AI service", async () => {
  const mockAskForLinks = vi
    .fn()
    .mockReturnValue(Effect.succeed(null));

  const mockReadFileString = vi
    .fn()
    .mockReturnValue(Effect.succeed("Valid transcript content"));

  const result = await analyzeTranscriptForLinks({
    transcriptPath: "/path/to/transcript.txt" as AbsolutePath,
    originalVideoPath: "/path/to/video.mp4" as AbsolutePath,
  }).pipe(
    Effect.provideService(AIService, {
      askForLinks: mockAskForLinks,
      articleFromTranscript: vi.fn(),
      titleFromTranscript: vi.fn(),
    }),
    Effect.provideService(FileSystem.FileSystem, {
      readFileString: mockReadFileString,
    }),
    Effect.runPromise
  );

  expect(result).toEqual([]);
});