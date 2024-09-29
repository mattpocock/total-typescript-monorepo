// http://localhost:3004/courses/exercises/7d9872d2-7474-42a3-a06d-6e69e5f3aed5/edit

import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

const publicProcedure = t.procedure;

const appRouter = t.router({
  myFirstQuery: publicProcedure.query(() => {
    return "Hello, world!";
  }),
});
