import { p } from "~/db";
import { publicProcedure, t } from "./trpc";

export const appRouter = t.router({
  courses: t.router({
    list: publicProcedure.query(async () => {}),
  }),
});

export type AppRouter = typeof appRouter;
