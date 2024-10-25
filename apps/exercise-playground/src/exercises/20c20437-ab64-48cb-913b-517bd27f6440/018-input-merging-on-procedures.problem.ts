import { initTRPC } from "@trpc/server";
import { expect, it, vitest } from "vitest";
import { z } from "zod";

const t = initTRPC.create();

const publicProcedure = t.procedure;

const appRouter = t.router({
  greetMe: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(({ input }) => {
      return `Hello, ${input.name}!`;
    }),
});

it("Should force you to pass the currentUrl and name to the greetMe procedure", async () => {
  const caller = t.createCallerFactory(appRouter)({});

  await expect(
    caller.greetMe(
      // @ts-expect-error - missing currentUrl
      { name: "Alice" }
    )
  ).rejects.toThrowError();
  await expect(
    caller.greetMe(
      // @ts-expect-error - missing name
      { currentUrl: "http://example.com" }
    )
  ).rejects.toThrowError();

  await expect(
    caller.greetMe({ currentUrl: "http://example.com", name: "Alice" })
  ).resolves.toBe("Hello, Alice!");
});

it("Should log the currentUrl", async () => {
  const caller = t.createCallerFactory(appRouter)({});

  const consoleSpy = vitest.spyOn(console, "log");

  await caller.greetMe({ currentUrl: "http://example.com", name: "Alice" });

  expect(consoleSpy).toHaveBeenCalledWith("http://example.com");
});