import { SKILL_RECORDINGS_REPO_LOCATION } from "@total-typescript/shared";
import { execSync } from "child_process";
import { addExerciseToBook } from "./addExerciseToBook.js";
import { appendVideoToTimeline } from "./appendVideoToTimeline.js";
import { encodeAllVideos } from "./encodeAllVideos.js";
import { selectLatestOBSVideo } from "./selectLatestOBSVideo.js";
import { trimLatestOBSVideo } from "./trimLatestOBSVideo.js";

export type Command<TArgs extends readonly string[]> = {
  scriptkitName: string;
  fileName: string;
  description: string;
  cliCommand: string;
  args?: [...TArgs];
  run: (...args: TArgs) => any;
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
    scriptkitName: "Post Article to Skill Recordings",
    fileName: "post-article-to-skill-recordings",
    description: "Post an issue to the Skill Recordings repo.",
    cliCommand: "post-article-to-skill-recordings",
    args: ["Sanity Link", "Title"],
    run: async (sanityLink, title) => {
      execSync(
        `(cd "${SKILL_RECORDINGS_REPO_LOCATION}" && gh issue create --title "${
          "Article: " + title
        }" --body "${sanityLink}")`
      );
    },
  },
  {
    scriptkitName: "Append Video to Davinci Resolve Timeline",
    fileName: "append-video-to-timeline",
    description: "Append the latest OBS video to the Davinci Resolve timeline.",
    cliCommand: "append-video-to-timeline",
    run: appendVideoToTimeline,
  },
  {
    scriptkitName: "Add Exercise To Book",
    fileName: "add-exercise-to-book",
    description: "Add an exercise to the TT book.",
    cliCommand: "add-exercise-to-book",
    args: ["glob"],
    run: addExerciseToBook,
  },
]);
