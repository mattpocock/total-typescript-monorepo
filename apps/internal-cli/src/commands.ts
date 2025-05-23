import { env } from "@total-typescript/env";
import {
  runDavinciResolveScript,
  SKILL_RECORDINGS_REPO_LOCATION,
} from "@total-typescript/shared";
import { execSync } from "child_process";

export type Command<TArgs extends readonly string[]> = {
  cliCommand: string;
  description: string;
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
    cliCommand: "move-raw-footage-to-long-term-storage",
    description: "Move raw footage to long term storage.",
    run: async () => {
      execSync(
        `(cd "${env.LONG_TERM_FOOTAGE_STORAGE_DIRECTORY}" && mv "${env.OBS_OUTPUT_DIRECTORY}"/* .)`
      );
    },
  },
  {
    cliCommand: "create-timeline",
    description: "Create a new empty timeline in the current project.",
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
    cliCommand: "add-current-timeline-to-render-queue",
    description: "Add the current timeline to the render queue.",
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
    cliCommand: "export-subtitles",
    description: "Export subtitles from the current timeline as SRT.",
    run: async () => {
      await runDavinciResolveScript("add-subtitles.lua", {
        OUTPUT_FOLDER: env.DAVINCI_EXPORT_DIRECTORY,
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
    cliCommand: "post-article-to-skill-recordings",
    description: "Post an issue to the Skill Recordings repo.",
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
    cliCommand: "zoom-clip",
    description:
      "Zoom and reposition the currently selected clip in the timeline.",
    run: async () => {
      await runDavinciResolveScript("zoom-clip.lua", {}).match(
        (r) => {
          console.log(r.stdout);
        },
        (e) => {
          console.error(e);
        }
      );
    },
  },
]);
