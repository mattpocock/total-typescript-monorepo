// http://localhost:3004/courses/exercises/96b929af-dfa9-49bb-ae57-99aa1f02cf45/edit

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./parsing-inputs-with-zod.explainer.server";

const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/my-trpc-endpoint",
    }),
  ],
});

// 4. Now, we'll get a type error unless we pass
// a string to our query
const result = await trpcClient.myFirstQuery.query("world");

console.log(result);
