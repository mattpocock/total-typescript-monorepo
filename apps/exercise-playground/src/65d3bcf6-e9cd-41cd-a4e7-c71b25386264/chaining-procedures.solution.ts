// http://localhost:3004/courses/exercises/65d3bcf6-e9cd-41cd-a4e7-c71b25386264/edit

import type { Equal, Expect } from "@total-typescript/helpers";
import { initTRPC, TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";

const t = initTRPC
  .context<{
    authToken: string;
  }>()
  .create();

const publicProcedure = t.procedure;

const authenticatedProcedure = publicProcedure.use(async (opts) => {
  if (opts.ctx.authToken !== "secret") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return opts.next({
    ctx: {
      loggedInUserName: "Alice",
    },
  });
});

const organizationProcedure = authenticatedProcedure.use(async (opts) => {
  if (opts.ctx.authToken !== "secret") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return opts.next({
    ctx: {
      loggedInUserOrganization: "AcmeCorp",
    },
  });
});

export const router = t.router({
  getLoggedInUserName: authenticatedProcedure.query(({ ctx }) => {
    // Expect that the context contains the
    // loggedInUserName and authToken
    type tests = Expect<
      Equal<typeof ctx, { authToken: string; loggedInUserName: string }>
    >;

    return `Hello, ${ctx.loggedInUserName}!`;
  }),
  getLoggedInUserOrganization: organizationProcedure.query(({ ctx }) => {
    // Expect that the context contains the
    // loggedInUserName, authToken, and
    // loggedInUserOrganization
    type tests = Expect<
      Equal<
        typeof ctx,
        {
          authToken: string;
          loggedInUserName: string;
          loggedInUserOrganization: string;
        }
      >
    >;

    return {
      name: ctx.loggedInUserName,
      organization: ctx.loggedInUserOrganization,
    };
  }),
});

describe("getLoggedInUserName", () => {
  it('Should error if the auth token is not "secret"', async () => {
    const caller = t.createCallerFactory(router);

    const callerWithContext = caller({ authToken: "not-secret" });

    await expect(callerWithContext.getLoggedInUserName()).rejects.toMatchObject(
      {
        code: "UNAUTHORIZED",
      }
    );
  });

  it('Should return "Hello, Alice!" if the auth token is "secret"', async () => {
    const caller = t.createCallerFactory(router);

    const callerWithContext = caller({ authToken: "secret" });

    const result = await callerWithContext.getLoggedInUserName();

    expect(result).toBe("Hello, Alice!");
  });
});

describe("getLoggedInUserOrganization", () => {
  it("Should return the correct data if the authToken is correct", async () => {
    const caller = t.createCallerFactory(router);

    const callerWithContext = caller({ authToken: "secret" });

    const result = await callerWithContext.getLoggedInUserOrganization();

    expect(result).toStrictEqual({
      name: "Alice",
      organization: "AcmeCorp",
    });
  });
});
