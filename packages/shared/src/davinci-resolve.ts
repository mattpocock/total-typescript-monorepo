import { resolve } from "path";
import { DAVINCI_RESOLVE_SCRIPTS_LOCATION } from "./constants.js";
import type { EmptyObject } from "./types.js";
import { execAsync, exitProcessWithError } from "./utils.js";
import { safeTry } from "neverthrow";

type Scripts = {
  "clip-and-append.lua": {
    INPUT_VIDEO: string;
    CLIPS_TO_APPEND: string;
  };
  "import-file-to-bin.lua": {
    INPUT: string;
  };
  "get-current-timeline-clip.lua": EmptyObject;
  "add-subtitles.lua": EmptyObject;
};

export const runDavinciResolveScript = <TScript extends keyof Scripts>(
  script: TScript,
  env: Scripts[TScript]
) => {
  return safeTry(async function* () {
    yield* checkFuscriptIsInstalled();

    const scriptPath = resolve(DAVINCI_RESOLVE_SCRIPTS_LOCATION, script);

    const envString = Object.entries(env)
      .map(([key, value]) => {
        return `${key}="${value}"`;
      })
      .join(" ");

    return execAsync(`${envString} fuscript -q "${scriptPath}"`).map(
      (r) => r.stdout
    );
  });
};

const checkFuscriptIsInstalled = () => {
  return execAsync("fuscript --version").mapErr((e) => {
    return new Error("fuscript is not installed", {
      cause: e,
    });
  });
};
