import { expect, it, vi } from "vitest";
import { trimLatestOBSVideo } from "../trimLatestOBSVideo.js";
import * as ffmpeg from "@total-typescript/ffmpeg";
import * as ttShared from "@total-typescript/shared";
import { ok, Result, ResultAsync } from "neverthrow";

vi.mock("@total-typescript/ffmpeg", () => ({
  getFPS: () => new ResultAsync(Promise.resolve(ok(60))),
  findSilenceInVideo: () =>
    new ResultAsync(
      Promise.resolve(
        ok({
          startTime: 0,
          endTime: 10,
        })
      )
    ),
  SILENCE_DURATION: 10,
  PADDING: 10,
  THRESHOLD: 10,
  CouldNotFindEndTimeError: class {},
  CouldNotFindStartTimeError: class {},
  trimVideo: () => {
    return new ResultAsync(Promise.resolve(ok(undefined)));
  },
  normalizeAudio: async () => {},
}));

vi.mock("@total-typescript/shared", async (importOriginal) => ({
  ...((await importOriginal()) as any),
  getActiveEditorFilePath: () =>
    new ResultAsync(Promise.resolve(ok("/repos/01-video.problem.ts"))),
  ExternalDriveNotFoundError: class {},
  REPOS_FOLDER: "/repos",
  ensureDir: () => new ResultAsync(Promise.resolve(ok(undefined))),
  execAsync: () => {},
}));

vi.mock("../constants.js", () => ({
  getExternalDrive: () => new ResultAsync(Promise.resolve(ok("/Drive"))),
  OBS_OUTPUT_DIRECTORY: "/Drive/output",
}));

vi.mock("../getLatestOBSVideo.js", () => ({
  getLatestOBSVideo: () =>
    new ResultAsync(Promise.resolve(ok("/tmp/video.mp4"))),
}));

it("Should call trim on the video", async () => {
  const spy = vi.spyOn(ffmpeg, "trimVideo");

  await trimLatestOBSVideo();

  expect(spy).toHaveBeenLastCalledWith(
    "/tmp/video.mp4",
    "/Drive/output/01-video.problem.un-encoded.mp4",
    0,
    10
  );
});

// it("Should normalize the video", async () => {
//   const spy = vi.spyOn(ffmpeg, "normalizeAudio");

//   await trimLatestOBSVideo();

//   expect(spy).not.toHaveBeenLastCalledWith(
//     "/Drive/output/01-video.problem.un-encoded.un-normalized.mp4",
//     "/Drive/output/01-video.problem.un-encoded.mp4",
//   );
// });

// it("Should delete the un-normalized video", async () => {
//   const spy = vi.spyOn(ttShared, "execAsync");

//   await trimLatestOBSVideo();

//   expect(spy).toHaveBeenLastCalledWith(
//     `rm /Drive/output/01-video.problem.un-encoded.un-normalized.mp4`,
//   );
// });

it("Should create a directory for the output folder", async () => {
  const ensureDir = vi.spyOn(ttShared, "ensureDir");
  await trimLatestOBSVideo();

  expect(ensureDir).toHaveBeenLastCalledWith("/Drive/output");
});
