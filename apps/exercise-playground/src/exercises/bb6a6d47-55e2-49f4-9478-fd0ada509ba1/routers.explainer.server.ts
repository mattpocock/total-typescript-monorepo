import { initTRPC } from "@trpc/server";

// 1. Create a new TRPC instance
const t = initTRPC.create();

// 2. Create a router
const appRouter = t.router({
  // Queries and mutations live in here!
});

// 3. Export the router
export type AppRouter = typeof appRouter;
