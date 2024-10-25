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

const __DO_NOT_LEAK_OR_YOU_WILL_BE_FIRED__ = {
  SENSITIVE_STUFF: "DO NOT LEAK ME!",
};

export const router = t.router({
  getLoggedInUserOrganization: organizationProcedure.query(({ ctx }) => {
    return {
      ...__DO_NOT_LEAK_OR_YOU_WILL_BE_FIRED__,
      name: ctx.loggedInUserName,
      organization: ctx.loggedInUserOrganization,
    };
  }),
});

describe("getLoggedInUserOrganization", () => {
  it("Should return the correct data if the authToken is correct", async () => {
    const caller = t.createCallerFactory(router);

    const callerWithContext = caller({ authToken: "secret" });

    const result = await callerWithContext.getLoggedInUserOrganization();

    expect(result).toMatchObject({
      name: "Alice",
      organization: "AcmeCorp",
    });
  });

  it("Should not leak sensitive information in the output", async () => {
    const caller = t.createCallerFactory(router);

    const callerWithContext = caller({ authToken: "secret" });

    const result = await callerWithContext.getLoggedInUserOrganization();

    expect(result).not.toHaveProperty("SENSITIVE_STUFF");
  });
});