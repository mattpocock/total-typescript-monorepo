import { initTRPC } from "@trpc/server";
import { expect, it } from "vitest";

const t = initTRPC.create();

const publicProcedure = t.procedure;

const appRouter = t.router({
  createUser: publicProcedure.mutation(() => "create user"),
  updateUser: publicProcedure.mutation(() => "update user"),
  deleteUser: publicProcedure.mutation(() => "delete user"),

  createOrganization: publicProcedure.mutation(() => "create organization"),
  updateOrganization: publicProcedure.mutation(() => "update organization"),
  deleteOrganization: publicProcedure.mutation(() => "delete organization"),
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