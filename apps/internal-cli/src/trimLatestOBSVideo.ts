import { getActiveEditorFilePath } from "./getActiveEditorFilePath.js";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";

export const trimLatestOBSVideo = async () => {
  const latestOBSVideo = await getLatestOBSVideo();

  const activeEditorFilePath = await getActiveEditorFilePath();

  if (!activeEditorFilePath) {
    throw new Error("Active editor file path not found");
  }
};
