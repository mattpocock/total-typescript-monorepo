import { analytics } from "./analytics";
import { collections } from "./collections";
import { concepts } from "./concepts";
import { courses } from "./courses";
import { exercises } from "./exercises";
import { posts } from "./posts";
import { sections } from "./sections";
import { videos } from "./videos";
import { workflows } from "./workflows";

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
  sections,
  exercises,
  analytics,
  videos,
  workflows,
  concepts,
};
