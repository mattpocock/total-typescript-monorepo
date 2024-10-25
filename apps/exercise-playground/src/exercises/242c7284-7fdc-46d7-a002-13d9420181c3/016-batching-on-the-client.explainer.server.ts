import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { createHTTPServer } from "@trpc/server/adapters/standalone";

const t = initTRPC.create();

const publicProcedure = t.procedure;

const appRouter = t.router({
  myFirstQuery: publicProcedure.input(z.string()).query(({ input }) => {
    return `Hello, ${input}!`;
  }),
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
});

server.listen(3000);

server.server.on("request", (req, res) => {
  console.log("Request received!");
});

console.log("Server started at http://localhost:3000");