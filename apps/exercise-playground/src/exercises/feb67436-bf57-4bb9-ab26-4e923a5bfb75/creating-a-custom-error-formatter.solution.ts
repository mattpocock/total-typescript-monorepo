// http://localhost:3004/courses/exercises/feb67436-bf57-4bb9-ab26-4e923a5bfb75/edit

import type { Equal, Expect } from "@total-typescript/helpers";
import { initTRPC, TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { z } from "zod";

const t = initTRPC
  .context<{
    user: {
      isLoggedIn: boolean;
      organizationId?: string;
    };
  }>()
  .create();

const publicProcedure = t.procedure;

const authedMiddleware = t.middleware(async (opts) => {
  const { ctx } = opts;
  if (!ctx.user.isLoggedIn) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next();
});

const loggingMiddleware = t.middleware(async (opts) => {
  const start = Date.now();

  const result = await opts.next();

  const durationMs = Date.now() - start;
  const meta = { path: opts.path, type: opts.type, durationMs };

  result.ok
    ? console.log("OK request timing:", meta)
    : console.error("Non-OK request timing", meta);

  return result;
});

const authedProcedure = publicProcedure
  .use(authedMiddleware)
  .use(loggingMiddleware);

const organisationProcedure = publicProcedure
  .use(authedMiddleware)
  .use(loggingMiddleware)
  .use(async (opts) => {
    const { ctx } = opts;

    if (!ctx.user.organizationId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No organization found",
      });
    }

    return opts.next({
      ctx: {
        user: {
          ...ctx.user,
          organizationId: ctx.user.organizationId,
        },
      },
    });
  });

const appRouter = t.router({
  public: publicProcedure.query(() => {
    return {
      public: true,
    };
  }),
  loggedInOnly: authedProcedure.query(({ ctx }) => {
    type test = Expect<Equal<typeof ctx.user.isLoggedIn, boolean>>;
    return {
      loggedIn: ctx.user.isLoggedIn,
    };
  }),
  getOrgId: organisationProcedure.query(({ ctx }) => {
    type test = Expect<Equal<typeof ctx.user.organizationId, string>>;
    return ctx.user.organizationId;
  }),
});

describe("public", () => {
  it("Should allow anyone to access", async () => {
    const caller = t.createCallerFactory(appRouter)({
      user: {
        isLoggedIn: false,
      },
    });

    expect(await caller.public()).toEqual({ public: true });
  });
});

describe("loggedInOnly", () => {
  it("Should require user to be logged in", async () => {
    const caller = t.createCallerFactory(appRouter)({
      user: {
        isLoggedIn: false,
      },
    });

    await expect(caller.loggedInOnly()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("Should allow user to be logged in", async () => {
    const caller = t.createCallerFactory(appRouter)({
      user: {
        isLoggedIn: true,
      },
    });

    expect(await caller.loggedInOnly()).toEqual({ loggedIn: true });
  });
});

describe("getOrgId", () => {
  it("Should require user to be logged in", async () => {
    const caller = t.createCallerFactory(appRouter)({
      user: {
        isLoggedIn: false,
      },
    });

    await expect(caller.getOrgId()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("Should require user to have an organization", async () => {
    const caller = t.createCallerFactory(appRouter)({
      user: {
        isLoggedIn: true,
      },
    });

    await expect(caller.getOrgId()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("Should work if user has an organizationId", async () => {
    const caller = t.createCallerFactory(appRouter)({
      user: {
        isLoggedIn: true,
        organizationId: "123",
      },
    });

    expect(await caller.getOrgId()).toEqual("123");
  });
});
