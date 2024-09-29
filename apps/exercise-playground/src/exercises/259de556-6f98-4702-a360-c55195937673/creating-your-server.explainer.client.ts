// http://localhost:3004/courses/exercises/259de556-6f98-4702-a360-c55195937673/edit

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./creating-your-server.explainer.server";

const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000",
    }),
  ],
});

const result = await trpcClient.myFirstMutation.mutate("world");

// 4. Let's console.log the result to see if it worked!
console.log(result);
