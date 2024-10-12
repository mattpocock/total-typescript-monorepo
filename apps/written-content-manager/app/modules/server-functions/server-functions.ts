import { collections } from "./collections";
import { courses } from "./courses";
import { posts } from "./posts";

/**
 * The entrypoint for all server actions.
 *
 * All loaders/actions in Remix should be a thin wrapper around these, which are
 * unit tested with 100% coverage turned on.
 *
 * Redirection logic should belong with Remix, but all db logic should live here.
 *
 * @example
 *
 * serverFunctions.collections.create();
 * serverFunctions.collections.get({ id: collectionId });
 */
export const serverFunctions = {
  collections,
  posts,
  courses,
};
