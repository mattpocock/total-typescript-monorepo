import { initTRPC } from "@trpc/server";
import { z } from "zod";
// 1. Import createHTTPServer from the standalone adapter
import { createHTTPServer } from "@trpc/server/adapters/standalone";

const t = initTRPC.create();

const publicProcedure = t.procedure;

const appRouter = t.router({
  myFirstQuery: publicProcedure.input(z.string()).query(({ input }) => {
    return `Hello, ${input}!`;
  }),
  myFirstMutation: publicProcedure.input(z.string()).mutation(({ input }) => {
    return `Hello, ${input}!`;
  }),
});

export type AppRouter = typeof appRouter;

// 2. Create a server using createHTTPServer,
// passing in the router
const server = createHTTPServer({
  router: appRouter,
});

// 3. Start the server on port 3000
server.listen(3000);

console.log("Server started at http://localhost:3000");