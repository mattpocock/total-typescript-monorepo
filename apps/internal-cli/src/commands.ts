import { execSync } from "child_process";
import { encodeAllVideos } from "./encodeAllVideos.js";
import { openPairedVideoDir } from "./openPairedVideoDir.js";
import { selectLatestOBSVideo } from "./selectLatestOBSVideo.js";
import { trimLatestOBSVideo } from "./trimLatestOBSVideo.js";
import { SKILL_RECORDINGS_REPO_LOCATION } from "@total-typescript/shared";
import { appendVideoToTimeline } from "./appendVideoToTimeline.js";
import { clearUnusedFootageFromDisk } from "./clearUnusedFootageFromDisk.js";

export type Command<TArgs extends readonly string[]> = {
  scriptkitName: string;
  fileName: string;
  description: string;
  cliCommand: string;
  args?: [...TArgs];
  run: (...args: TArgs) => Promise<void>;
};

const createCommands = <TArgs extends string[][]>(args: {
  [K in keyof TArgs]: Command<TArgs[K]>;
}) => {
  return args;
};

export const commands = createCommands([
  {
    scriptkitName: "Encode All Videos",
    fileName: "encode-all-videos",
    description:
      "Encode all unencoded videos in the external drive and save in place.",
    cliCommand: "encode-all-videos",
    run: encodeAllVideos,
  },
  {
    scriptkitName: "Select Latest OBS Video",
    fileName: "select-latest-obs-video",
    description: "Select the latest OBS video from the external drive.",
    cliCommand: "select-latest-obs-video",
    run: selectLatestOBSVideo,
  },
  {
    scriptkitName: "Trim Latest OBS Video",
    fileName: "trim-latest-obs-video",
    description: "Trim the latest OBS video from the external drive.",
    cliCommand: "trim-latest-obs-video",
    run: trimLatestOBSVideo,
  },
  {
    scriptkitName: "Open Paired Video Dir",
    fileName: "open-paired-video-dir",
    description: "Open the paired video directory.",
    cliCommand: "open-paired-video-dir",
    run: openPairedVideoDir,
  },
  {
    scriptkitName: "Post Article to Skill Recordings",
    fileName: "post-article-to-skill-recordings",
    description: "Post an issue to the Skill Recordings repo.",
    cliCommand: "post-article-to-skill-recordings",
    args: ["Sanity Link", "Title"],
    run: async (sanityLink, title) => {
      execSync(
        `(cd "${SKILL_RECORDINGS_REPO_LOCATION}" && gh issue create --title "${
          "Article: " + title
        }" --body "${sanityLink}")`,
      );
    },
  },
  {
    scriptkitName: "Append Video to Davinci Resolve Timeline",
    fileName: "append-video-to-timeline",
    description: "Append the latest OBS video to the Davinci Resolve timeline.",
    cliCommand: "append-video-to-timeline",
    args: ["FPS"],
    run: appendVideoToTimeline,
  },
  {
    scriptkitName: "Clear Unused Footage From Disk",
    fileName: "clear-unused-footage-from-disk",
    description:
      "Clear footage not used in DaVinci Resolve from the external drive.",
    cliCommand: "clear-unused-footage-from-disk",
    run: clearUnusedFootageFromDisk,
  },
]);
