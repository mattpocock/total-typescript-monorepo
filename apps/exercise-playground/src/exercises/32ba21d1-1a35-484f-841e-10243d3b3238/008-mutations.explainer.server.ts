import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

const publicProcedure = t.procedure;

const appRouter = t.router({
  myFirstQuery: publicProcedure.input(z.string()).query(({ input }) => {
    return `Hello, ${input}!`;
  }),
  // 1. Create a mutation with the same input schema
  myFirstMutation: publicProcedure.input(z.string()).mutation(({ input }) => {
    return `Hello, ${input}!`;
  }),
});

export type AppRouter = typeof appRouter;