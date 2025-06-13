import { Context, Effect } from "effect";

type Env = {
  dirs: {
    exportDirectoryInUnix: string;
    obsOutputDirectory: string;
    davinciExportDirectory: string;
    longTermFootageStorageDirectory: string;
    dropboxDirectory: string;
    shortsExportDirectory: string;
    openaiApiKey: string;
  };
  videoOutputExtension: string;
};

export class EnvService extends Context.Tag("EnvService")<EnvService, Env>() {}

export const realEnvService = EnvService.of({
  dirs: {
    exportDirectoryInUnix: process.env.EXPORT_DIRECTORY_IN_UNIX!,
    obsOutputDirectory: process.env.OBS_OUTPUT_DIRECTORY!,
    davinciExportDirectory: process.env.DAVINCI_EXPORT_DIRECTORY!,
    longTermFootageStorageDirectory:
      process.env.LONG_TERM_FOOTAGE_STORAGE_DIRECTORY!,
    dropboxDirectory: process.env.DROPBOX_DIRECTORY!,
    shortsExportDirectory: process.env.SHORTS_EXPORT_DIRECTORY!,
    openaiApiKey: process.env.OPENAI_API_KEY!,
  },
  videoOutputExtension: "mp4",
});
