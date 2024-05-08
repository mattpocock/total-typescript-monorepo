import { encodeAllVideos } from "./encodeAllVideos.js";
import { selectLatestOBSVideo } from "./selectLatestOBSVideo.js";
import { trimLatestOBSVideo } from "./trimLatestOBSVideo.js";

export type Command = {
  scriptkitName: string;
  fileName: string;
  description: string;
  cliCommand: string;
  run: (...args: any[]) => Promise<void>;
};

export const commands: Command[] = [
  {
    scriptkitName: "Encode All Videos",
    fileName: "encode-all-videos",
    description:
      "Encode all unencoded videos in the external drive and save in place.",
    cliCommand: "encode-all-videos",
    run: encodeAllVideos,
  },
  {
    scriptkitName: "Select Latest OBS Video",
    fileName: "select-latest-obs-video",
    description: "Select the latest OBS video from the external drive.",
    cliCommand: "select-latest-obs-video",
    run: selectLatestOBSVideo,
  },
  {
    scriptkitName: "Trim Latest OBS Video",
    fileName: "trim-latest-obs-video",
    description: "Trim the latest OBS video from the external drive.",
    cliCommand: "trim-latest-obs-video",
    run: trimLatestOBSVideo,
  },
];
