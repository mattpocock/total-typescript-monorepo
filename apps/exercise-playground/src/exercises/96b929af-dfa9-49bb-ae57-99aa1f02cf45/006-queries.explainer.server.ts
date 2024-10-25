import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

// 1. Save our publicProcedure as a reference
const publicProcedure = t.procedure;

const appRouter = t.router({
  // 2. Use our publicProcedure to create a query
  myFirstQuery: publicProcedure.query(() => {
    return "Hello, world!";
  }),
});

export type AppRouter = typeof appRouter;