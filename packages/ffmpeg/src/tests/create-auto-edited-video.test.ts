import { expect, it, vi } from "vitest";
import { createAutoEditedVideo } from "../index.js";
import { ExecService, type AbsolutePath } from "@total-typescript/shared";
import { Effect, pipe } from "effect";
import { FileSystem } from "@effect/platform";

it("Should work", () => {
  const result = pipe(
    createAutoEditedVideo({
      inputVideo: "test/fixtures/input.mp4" as AbsolutePath,
      outputVideo: "test/fixtures/output.mp4" as AbsolutePath,
    }),
    Effect.provideService(ExecService, {
      exec: vi.fn(),
    }),
    Effect.provide(FileSystem.layerNoop({})),
    Effect.runSync
  );
});
