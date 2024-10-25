import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "./007-parsing-inputs-with-zod.explainer.server";

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000",
    }),
  ],
});

// 4. Now, we'll get a type error unless we pass
// a string to our query
const result = await trpcClient.myFirstQuery.query("world");

console.log(result);