import { redirect } from "@remix-run/react";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { editPostUrl } from "~/routes";
import { createFormDataAction } from "~/utils";

export const action = createFormDataAction(async (_, args) => {
  const result = await serverFunctions.collections.addNewPost({
    collectionId: args.params.collectionId!,
  });

  return redirect(editPostUrl(result.socialPostId));
});
