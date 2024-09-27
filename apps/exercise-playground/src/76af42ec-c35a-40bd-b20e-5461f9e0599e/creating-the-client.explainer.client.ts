// http://localhost:3004/courses/exercises/76af42ec-c35a-40bd-b20e-5461f9e0599e/edit

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./creating-the-client.explainer.server";

// 1. Create a trpcClient, passing in AppRouter as the type
const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    // 2. Create a new httpBatchLink, pointing at your
    // desired URL (we'll explain this later)
    httpBatchLink({
      url: "http://localhost:3000",
    }),
  ],
});
