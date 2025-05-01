import {
  runDavinciResolveScript,
  SKILL_RECORDINGS_REPO_LOCATION,
} from "@total-typescript/shared";
import { execSync } from "child_process";
import { addExerciseToBook } from "./addExerciseToBook.js";
import { appendVideoToTimeline } from "./appendVideoToTimeline.js";
import { encodeAllVideos } from "./encodeAllVideos.js";
import { selectLatestOBSVideo } from "./selectLatestOBSVideo.js";
import { trimLatestOBSVideo } from "./trimLatestOBSVideo.js";
import { env } from "@total-typescript/env";

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
    scriptkitName: "Create New Timeline",
    fileName: "create-timeline",
    description: "Create a new empty timeline in the current project.",
    cliCommand: "create-timeline",
    run: async () => {
      await runDavinciResolveScript("create-timeline.lua", {}).match(
        (r) => {
          console.log(r.stdout);
        },
        (e) => {
          console.error(e);
        }
      );
    },
  },
  {
    scriptkitName: "Add Current Timeline to Render Queue",
    fileName: "add-current-timeline-to-render-queue",
    description: "Add the current timeline to the render queue.",
    cliCommand: "add-current-timeline-to-render-queue",
    run: async () => {
      await runDavinciResolveScript("add-timeline-to-render-queue.lua", {
        DAVINCI_EXPORT_DIRECTORY: env.DAVINCI_EXPORT_DIRECTORY,
      }).match(
        (r) => {
          console.log(r.stdout);
        },
        (e) => {
          console.error(e);
        }
      );
    },
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
    scriptkitName: "Append Video to Current Davinci Resolve Timeline",
    fileName: "append-video-to-timeline",
    description: "Append the latest OBS video to the Davinci Resolve timeline.",
    cliCommand: "append-video-to-timeline",
    run: () => appendVideoToTimeline("current-timeline"),
  },
  {
    scriptkitName: "Append Video to New Davinci Resolve Timeline",
    fileName: "append-video-to-new-timeline",
    description:
      "Append the latest OBS video to a new Davinci Resolve timeline.",
    cliCommand: "append-video-to-new-timeline",
    run: () => appendVideoToTimeline("new-timeline"),
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
