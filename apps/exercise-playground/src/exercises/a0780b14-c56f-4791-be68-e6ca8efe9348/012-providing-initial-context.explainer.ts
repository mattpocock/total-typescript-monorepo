import { initTRPC } from "@trpc/server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";

const t = initTRPC
  // 1. Provide some context to the server
  .context<{
    loggedInUserName: string;
  }>()
  .create();

const publicProcedure = t.procedure;

export const router = t.router({
  // 2. We can access the context in our query
  myFirstQuery: publicProcedure.query(({ ctx }) => {
    return `Hello, ${ctx.loggedInUserName}!`;
  }),
});

const server = createHTTPServer({
  router: router,
  createContext: () => ({
    // 3. We can provide the context when creating the server
    loggedInUserName: "Alice",
  }),
});