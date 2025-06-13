import { Effect, pipe } from "effect";
import type { EmptyObject } from "./types.js";
import { execAsync } from "./utils.js";

type Scripts = {
  "clip-and-append.lua": {
    INPUT_VIDEO: string;
    CLIPS_TO_APPEND: string;
    WSLENV: string;
  };
  "import-file-to-bin.lua": {
    INPUT: string;
  };
  "get-current-timeline-clip.lua": EmptyObject;
  "add-subtitles.lua": {
    OUTPUT_FOLDER: string;
  };
  "add-timeline-to-render-queue.lua": {
    DAVINCI_EXPORT_DIRECTORY: string;
  };
  "create-timeline.lua": EmptyObject;
  "zoom-clip.lua": EmptyObject;
};

const FUSCRIPT_LOCATION =
  "/mnt/d/Program\\ Files/Blackmagic\\ Design/DaVinci\\ Resolve/fuscript.exe";

class DavinciResolveScriptError extends Error {
  readonly _tag = "DavinciResolveScriptError";
  override message = "Failed to run script";

  constructor(public override cause: Error) {
    super();
  }
}

export const runDavinciResolveScript = <TScript extends keyof Scripts>(
  script: TScript,
  env: Scripts[TScript]
) => {
  return Effect.gen(function* () {
    yield* checkFuscriptIsInstalled();

    const scriptPath = `\\\\\\wsl.localhost\\Ubuntu-24.04\\home\\mattpocock\\repos\\ts\\total-typescript-monorepo\\packages\\resolve-scripts\\scripts\\${script}`;

    const envString = Object.entries(env)
      .map(([key, value]) => {
        return `${key}="${value}"`;
      })
      .join(" ");

    const result = yield* execAsync(
      `${envString} ${FUSCRIPT_LOCATION} -q "${scriptPath}"`
    );

    return result;
  }).pipe(
    Effect.catchAll((e) => {
      return Effect.fail(new DavinciResolveScriptError(e));
    })
  );
};

const checkFuscriptIsInstalled = () => {
  return pipe(
    execAsync(`${FUSCRIPT_LOCATION} --version`),
    Effect.catchAll((e) => {
      return Effect.die(new Error("fuscript is not installed", { cause: e }));
    })
  );
};
