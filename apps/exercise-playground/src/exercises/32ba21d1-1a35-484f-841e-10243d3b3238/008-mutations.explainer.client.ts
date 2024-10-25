import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./mutations.explainer.server";

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000",
    }),
  ],
});

// 2. Change the call so we're calling the mutation instead
const result = await trpcClient.myFirstMutation.mutate("world");

console.log(result);