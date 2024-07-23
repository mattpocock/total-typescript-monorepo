import { expect, it, vi } from "vitest";
import { trimLatestOBSVideo } from "../trimLatestOBSVideo.js";
import * as ffmpeg from "@total-typescript/ffmpeg";
import * as ttShared from "@total-typescript/shared";

vi.mock("@total-typescript/ffmpeg", () => ({
  getFPS: async () => 60,
  findSilenceInVideo: async () => ({
    startTime: 0,
    endTime: 10,
  }),
  SILENCE_DURATION: 10,
  PADDING: 10,
  THRESHOLD: 10,
  CouldNotFindEndTimeError: class {},
  CouldNotFindStartTimeError: class {},
  trimVideo: async () => {},
  normalizeAudio: async () => {},
}));

vi.mock("@total-typescript/shared", async (importOriginal) => ({
  ...((await importOriginal()) as any),
  getActiveEditorFilePath: async () => "/repos/01-video.problem.ts",
  ExternalDriveNotFoundError: class {},
  REPOS_FOLDER: "/repos",
  ensureDir: () => {},
  execAsync: () => {},
}));

vi.mock("../constants.js", () => ({
  getExternalDrive: async () => "/Drive",
  EXTERNAL_DRIVE_MOVIES_ROOT: "/Drive/output",
}));

vi.mock("../getLatestOBSVideo.js", () => ({
  getLatestOBSVideo: async () => "/tmp/video.mp4",
}));

it("Should call trim on the video", async () => {
  const spy = vi.spyOn(ffmpeg, "trimVideo");

  await trimLatestOBSVideo();

  expect(spy).toHaveBeenLastCalledWith(
    "/tmp/video.mp4",
    "/Drive/output/01-video.problem.un-encoded.mp4",
    0,
    10,
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
