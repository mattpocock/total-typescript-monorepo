// http://localhost:3004/courses/exercises/242c7284-7fdc-46d7-a002-13d9420181c3/edit

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./batching-on-the-client.explainer.server";

const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000",
    }),
  ],
});

// These will make three separate requests, one for each query
// const unbatchedResult = await trpcClient.myFirstQuery.query("Matt");
// const unbatchedResult2 = await trpcClient.myFirstQuery.query("John");
// const unbatchedResult3 = await trpcClient.myFirstQuery.query("Jane");

// This will make a single request with all three queries,
// without any extra logic on the client side
// const batchedResult = await Promise.all([
//   trpcClient.myFirstQuery.query("Matt"),
//   trpcClient.myFirstQuery.query("John"),
//   trpcClient.myFirstQuery.query("Jane"),
// ]);