import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./creating-your-server.explainer.server";

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000",
    }),
  ],
});

const result = await trpcClient.myFirstMutation.mutate("world");

// 4. Let's console.log the result to see if it worked!
console.log(result);