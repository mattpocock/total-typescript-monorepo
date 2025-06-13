import { env } from "@total-typescript/env";
import {
  ExecService,
  realExecService,
  runDavinciResolveScript,
  SKILL_RECORDINGS_REPO_LOCATION,
} from "@total-typescript/shared";
import { execSync } from "child_process";
import { Effect, pipe } from "effect";

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

const runEffect = <T extends { stdout: string }, E>(
  effect: Effect.Effect<T, E, ExecService>
) => {
  return pipe(
    effect,
    Effect.provideService(ExecService, realExecService),
    Effect.map((r) => {
      Effect.log(r.stdout);
      return Effect.succeed(void 0);
    }),
    Effect.catchAll((e) => {
      Effect.logError(e);
      return Effect.die(e);
    }),
    Effect.runPromise
  );
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
      await runEffect(runDavinciResolveScript("create-timeline.lua", {}));
    },
  },
  {
    cliCommand: "add-current-timeline-to-render-queue",
    description: "Add the current timeline to the render queue.",
    run: async () => {
      await runEffect(
        runDavinciResolveScript("add-timeline-to-render-queue.lua", {
          DAVINCI_EXPORT_DIRECTORY: env.DAVINCI_EXPORT_DIRECTORY,
        })
      );
    },
  },
  {
    cliCommand: "export-subtitles",
    description: "Export subtitles from the current timeline as SRT.",
    run: async () => {
      await runEffect(
        runDavinciResolveScript("add-subtitles.lua", {
          OUTPUT_FOLDER: env.DAVINCI_EXPORT_DIRECTORY,
        })
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
      await runEffect(runDavinciResolveScript("zoom-clip.lua", {}));
    },
  },
]);
