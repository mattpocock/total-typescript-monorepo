import { revealInFileExplorer } from "@total-typescript/shared";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";

export const selectLatestOBSVideo = async () => {
  await revealInFileExplorer(await getLatestOBSVideo());
};
