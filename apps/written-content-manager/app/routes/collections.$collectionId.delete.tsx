import { redirect } from "@remix-run/react";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { collectionsUrl } from "~/routes";
import { createJsonAction } from "~/utils";

export const action = createJsonAction(async (json, args) => {
  await serverFunctions.collections.delete({
    id: args.params.collectionId!,
  });

  return redirect(collectionsUrl());
});
