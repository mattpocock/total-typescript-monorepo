import { initTRPC } from "@trpc/server";
import { expect, it } from "vitest";
import { z } from "zod";

const t = initTRPC.create();

const publicProcedure = t.procedure;

const appRouter = t.router({
  double: publicProcedure.input(z.number()).query(({ input }) => {
    return input * 2;
  }),
});

it("Should double the number passed", async () => {
  throw new Error("Test not implemented!");
});