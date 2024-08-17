import { revealInFileExplorer } from "@total-typescript/shared";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";

export const selectLatestOBSVideo = () => {
  return getLatestOBSVideo().andThen(revealInFileExplorer);
};
