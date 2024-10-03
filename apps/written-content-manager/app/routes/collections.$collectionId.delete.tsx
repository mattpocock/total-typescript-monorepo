import { redirect } from "@remix-run/react";
import { collectionsUrl } from "~/routes";
import { trpc } from "~/trpc/client";
import { createJsonAction } from "~/utils";

export const clientAction = createJsonAction(async (json, args) => {
  await trpc.collections.delete.mutate({
    id: args.params.collectionId!,
  });

  return redirect(collectionsUrl());
});
