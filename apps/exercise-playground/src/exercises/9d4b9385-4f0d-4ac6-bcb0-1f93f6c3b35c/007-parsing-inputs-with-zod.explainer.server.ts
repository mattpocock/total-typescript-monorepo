import { initTRPC } from "@trpc/server";
// 1. Import zod
import { z } from "zod";

const t = initTRPC.create();

const publicProcedure = t.procedure;

const appRouter = t.router({
  myFirstQuery: publicProcedure
    // 2. Add a .input call to specify the input schema
    // for the query
    .input(z.string())
    // 3. Update the query to accept the input
    .query(({ input }) => {
      return `Hello, ${input}!`;
    }),
});

export type AppRouter = typeof appRouter;