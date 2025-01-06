import { safeTry } from "neverthrow";
import { resolve } from "path";
import { DAVINCI_RESOLVE_SCRIPTS_LOCATION } from "./constants.js";
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
  "add-subtitles.lua": EmptyObject;
};

const FUSCRIPT_LOCATION =
  "/mnt/d/Program\\ Files/Blackmagic\\ Design/DaVinci\\ Resolve/fuscript.exe";

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

    return execAsync(
      `${envString} ${FUSCRIPT_LOCATION} -q "${scriptPath}"`
    ).map((r) => r.stdout);
  });
};

const checkFuscriptIsInstalled = () => {
  return execAsync(`${FUSCRIPT_LOCATION} --version`).mapErr((e) => {
    return new Error("fuscript is not installed", {
      cause: e,
    });
  });
};
