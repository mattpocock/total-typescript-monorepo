import { revealInFileExplorer } from "@total-typescript/shared";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";

export const selectLatestOBSVideo = () => {
  return getLatestOBSVideo()
    .andThen(revealInFileExplorer)
    .mapErr((e) => {
      console.error(e);
      process.exit(1);
    });
};
