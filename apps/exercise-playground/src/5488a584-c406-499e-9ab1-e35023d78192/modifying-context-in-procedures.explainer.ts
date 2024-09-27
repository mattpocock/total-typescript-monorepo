// http://localhost:3004/courses/exercises/5488a584-c406-499e-9ab1-e35023d78192/edit

import { initTRPC, TRPCError } from "@trpc/server";
import { expect, it } from "vitest";

const t = initTRPC
  // 1. Create some initial context that must be passed in
  // when the server is initialized
  .context<{
    authToken: string;
  }>()
  .create();

const publicProcedure = t.procedure;

// 2. Create an authenticated procedure that inherits from the
// base publicProcedure
const authenticatedProcedure = publicProcedure.use(async (opts) => {
  // 2a. If the authToken is not 'secret', throw an error
  if (opts.ctx.authToken !== "secret") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  // 2b. If the authToken is 'secret', create
  // some new context that will be forwarded to the
  // next procedure
  return opts.next({
    ctx: {
      loggedInUserName: "Alice",
    },
  });
});

export const router = t.router({
  // 3. Use the authenticatedProcedure to create a query
  myFirstQuery: authenticatedProcedure.query(({ ctx }) => {
    // 4. Access the new context in the query. Notice that
    // authToken is not available at this level!
    return `Hello, ${ctx.loggedInUserName}!`;
  }),
});

it('Should error if the auth token is not "secret"', async () => {
  const caller = t.createCallerFactory(router);

  const callerWithContext = caller({ authToken: "not-secret" });

  await expect(callerWithContext.myFirstQuery()).rejects.toMatchObject({
    code: "UNAUTHORIZED",
  });
});

it('Should return "Hello, Alice!" if the auth token is "secret"', async () => {
  const caller = t.createCallerFactory(router);

  const callerWithContext = caller({ authToken: "secret" });

  const result = await callerWithContext.myFirstQuery();

  expect(result).toBe("Hello, Alice!");
});
