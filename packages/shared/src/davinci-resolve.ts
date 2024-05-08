import { resolve } from "path";
import { DAVINCI_RESOLVE_SCRIPTS_LOCATION } from "./constants.js";
import { exec } from "./exec.js";

type Scripts = {
  "clip-and-append.lua": {
    INPUT_VIDEO: string;
    CLIPS_TO_APPEND: string;
  };
  "import-file-to-bin.lua": {
    INPUT: string;
  };
  "get-current-timeline-clip.lua": {};
  "add-subtitles.lua": {};
};

export const runDavinciResolveScript = async <TScript extends keyof Scripts>(
  script: TScript,
  env: Scripts[TScript],
) => {
  const scriptPath = resolve(DAVINCI_RESOLVE_SCRIPTS_LOCATION, script);

  const result = await exec({
    env,
  })`fuscript -q ${scriptPath}`;

  return result.stdout;
};
