// http://localhost:3004/courses/exercises/96b929af-dfa9-49bb-ae57-99aa1f02cf45/edit

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./creating-the-client.explainer.server";

const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/my-trpc-endpoint",
    }),
  ],
});

// 3. Use the query
const result = await trpcClient.myFirstQuery.query();

// 4. Note that the type of the result is inferred
// from the server's implementation, and we can also
// CMD-click myFirstQuery to go to the server implementation!
console.log(result);
