import { safeTry } from "neverthrow";
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

export const runDavinciResolveScript = <TScript extends keyof Scripts>(
  script: TScript,
  env: Scripts[TScript]
) => {
  return safeTry(async function* () {
    yield* checkFuscriptIsInstalled();

    const scriptPath = `\\\\\\wsl.localhost\\Ubuntu-24.04\\home\\mattpocock\\repos\\ts\\total-typescript-monorepo\\packages\\resolve-scripts\\scripts\\${script}`;

    const envString = Object.entries(env)
      .map(([key, value]) => {
        return `${key}="${value}"`;
      })
      .join(" ");

    return execAsync(`${envString} ${FUSCRIPT_LOCATION} -q "${scriptPath}"`);
  });
};

const checkFuscriptIsInstalled = () => {
  return execAsync(`${FUSCRIPT_LOCATION} --version`).mapErr((e) => {
    return new Error("fuscript is not installed", {
      cause: e,
    });
  });
};
