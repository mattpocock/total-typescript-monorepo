import { serverFunctions } from "~/modules/server-functions/server-functions";
import { createFormDataAction } from "~/utils";

export const action = createFormDataAction(async (json, args) => {
  await serverFunctions.collections.linkExistingPost({
    postId: json.postId,
    collectionId: args.params.collectionId!,
  });

  return {
    success: true,
  };
});
