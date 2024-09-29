// http://localhost:3004/courses/exercises/010c2639-bd80-4444-bcf8-a1d04667f855/edit

import { initTRPC } from "@trpc/server";
import { expect, it } from "vitest";

const t = initTRPC.create();

const publicProcedure = t.procedure;

const appRouter = t.router({
  user: {
    create: publicProcedure.mutation(() => "create user"),
    update: publicProcedure.mutation(() => "update user"),
    delete: publicProcedure.mutation(() => "delete user"),
  },
  organization: {
    create: publicProcedure.mutation(() => "create organization"),
    update: publicProcedure.mutation(() => "update organization"),
    delete: publicProcedure.mutation(() => "delete organization"),
  },
});

it("Should let you call user.create", async () => {
  const caller = t.createCallerFactory(appRouter)({});
  await expect(caller.user.create()).resolves.toBe("create user");
});

it("Should let you call organization.create", async () => {
  const caller = t.createCallerFactory(appRouter)({});
  await expect(caller.organization.create()).resolves.toBe(
    "create organization"
  );
});

it("Should let you call user.update", async () => {
  const caller = t.createCallerFactory(appRouter)({});
  await expect(caller.user.update()).resolves.toBe("update user");
});

it("Should let you call organization.update", async () => {
  const caller = t.createCallerFactory(appRouter)({});
  await expect(caller.organization.update()).resolves.toBe(
    "update organization"
  );
});

it("Should let you call user.delete", async () => {
  const caller = t.createCallerFactory(appRouter)({});
  await expect(caller.user.delete()).resolves.toBe("delete user");
});

it("Should let you call organization.delete", async () => {
  const caller = t.createCallerFactory(appRouter)({});
  await expect(caller.organization.delete()).resolves.toBe(
    "delete organization"
  );
});
