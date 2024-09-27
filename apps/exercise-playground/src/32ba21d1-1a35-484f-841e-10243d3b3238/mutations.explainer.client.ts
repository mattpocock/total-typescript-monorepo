// http://localhost:3004/courses/exercises/96b929af-dfa9-49bb-ae57-99aa1f02cf45/edit

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./mutations.explainer.server";

const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/my-trpc-endpoint",
    }),
  ],
});

// 2. Change the call so we're calling the mutation instead
const result = await trpcClient.myFirstMutation.mutate("world");

console.log(result);
