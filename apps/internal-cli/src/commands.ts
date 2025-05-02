import { env } from "@total-typescript/env";
import {
  runDavinciResolveScript,
  SKILL_RECORDINGS_REPO_LOCATION,
} from "@total-typescript/shared";
import { execSync } from "child_process";
import { appendVideoToTimeline } from "./appendVideoToTimeline.js";

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
    scriptkitName: "Move Raw Footage to Long Term Storage",
    fileName: "move-raw-footage-to-long-term-storage",
    description: "Move raw footage to long term storage.",
    cliCommand: "move-raw-footage-to-long-term-storage",
    run: async () => {
      execSync(
        `(cd "${env.LONG_TERM_FOOTAGE_STORAGE_DIRECTORY}" && mv "${env.OBS_OUTPUT_DIRECTORY}"/* .)`
      );
    },
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
]);
