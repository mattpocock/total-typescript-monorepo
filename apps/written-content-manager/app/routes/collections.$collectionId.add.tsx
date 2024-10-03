import { redirect } from "@remix-run/react";
import { editCollectionUrl } from "~/routes";
import { trpc } from "~/trpc/client";
import { createJsonAction } from "~/utils";

export const clientAction = createJsonAction(async (json, args) => {
  const collection = await trpc.collections.create.mutate(json);

  return redirect(editCollectionUrl(collection.id));
});
