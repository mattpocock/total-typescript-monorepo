// http://localhost:3004/courses/exercises/96b929af-dfa9-49bb-ae57-99aa1f02cf45/edit

import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

const publicProcedure = t.procedure;

const appRouter = t.router({
  myFirstQuery: publicProcedure.input(z.string()).query((name) => {
    return `Hello, ${name}!`;
  }),
  // 1. Create a mutation with the same input schema
  myFirstMutation: publicProcedure.input(z.string()).mutation((name) => {
    return `Hello, ${name}!`;
  }),
});

export type AppRouter = typeof appRouter;
