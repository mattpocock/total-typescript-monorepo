import { Effect, pipe } from "effect";
import { expect, it, vi } from "vitest";
import { getFPS } from "../getFPS.js";
import { ExecService, type AbsolutePath } from "@total-typescript/shared";

it("should get the FPS of a video", async () => {
  const exec = vi.fn().mockReturnValue(
    Effect.succeed({
      stdout: "30/1",
    })
  );

  const fps = pipe(
    getFPS("test/fixtures/video.mp4" as AbsolutePath),
    Effect.provideService(ExecService, {
      exec,
    }),
    Effect.runSync
  );

  expect(fps).toBe(30);
});
