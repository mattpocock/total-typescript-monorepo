import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./queries.explainer.server";

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000",
    }),
  ],
});

// 3. Use the query
const result = await trpcClient.myFirstQuery.query();

// 4. Note that the type of the result is inferred
// from the server's implementation, and we can also
// CMD-click myFirstQuery to go to the server implementation!
console.log(result);