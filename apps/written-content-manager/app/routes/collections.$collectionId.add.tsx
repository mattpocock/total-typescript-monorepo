import { redirect } from "@remix-run/react";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { editCollectionUrl } from "~/routes";
import { createJsonAction } from "~/utils";

export const action = createJsonAction(async (json, args) => {
  const collection = await serverFunctions.collections.create();

  return redirect(editCollectionUrl(collection.id));
});
