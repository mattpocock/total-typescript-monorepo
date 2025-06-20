import type { EmptyObject } from "./types.js";
import { execAsync } from "./utils.js";
import { Effect } from "effect";

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

    return yield* execAsync(
      `${envString} ${FUSCRIPT_LOCATION} -q "${scriptPath}"`
    ).pipe(Effect.mapError((e) => new CouldNotRunDavinciResolveScriptError(e)));
  });
};

class CouldNotRunDavinciResolveScriptError extends Error {
  readonly _tag = "CouldNotRunDavinciResolveScriptError";
  constructor(public override cause: Error) {
    super("Could not run Davinci Resolve script.");
  }
}

class FuscriptNotInstalledError extends Error {
  readonly _tag = "FuscriptNotInstalledError";
  constructor(public override cause: Error) {
    super("fuscript is not installed");
  }
}

const checkFuscriptIsInstalled = () => {
  return execAsync(`${FUSCRIPT_LOCATION} --version`).pipe(
    Effect.mapError((e) => {
      return new FuscriptNotInstalledError(e);
    })
  );
};
