import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./creating-the-client.explainer.server";

// 1. Create a trpcClient, passing in AppRouter as the type
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    // 2. Create a new httpBatchLink, pointing at your
    // desired URL (we'll explain this later)
    httpBatchLink({
      url: "http://localhost:3000",
    }),
  ],
});