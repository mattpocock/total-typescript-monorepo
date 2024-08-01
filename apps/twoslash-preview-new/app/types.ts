import { z } from "zod";

export const renderType = z.union([
  z.object({
    mode: z.literal("all-square"),
  }),
  z.object({
    mode: z.literal("basic"),
    snippetIndex: z
      .string()
      .transform((x) => Number(x))
      .pipe(z.number().int().min(0)),
  }),
  z.object({
    mode: z.literal("all-basic"),
  }),
]);

export const htmlRendererSchema = z.intersection(
  z.object({
    uri: z.string(),
    cacheBuster: z.string().optional(),
  }),
  renderType,
);

export type HTMLRendererSearchParams = z.input<typeof htmlRendererSchema>;
