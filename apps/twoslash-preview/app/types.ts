import { z } from "zod";

export const RENDER_TYPES = {
  allSquareWithBorder: "all-square-with-border",
  basicWithBorder: "basic-with-border",
  allBasicWithBorder: "all-basic-with-border",
} as const;

export const renderType = z.union([
  z.object({
    mode: z.literal(RENDER_TYPES.allSquareWithBorder),
  }),
  z.object({
    mode: z.literal(RENDER_TYPES.basicWithBorder),
    snippetIndex: z
      .string()
      .transform((x) => Number(x))
      .pipe(z.number().int().min(0)),
  }),
  z.object({
    mode: z.literal(RENDER_TYPES.allBasicWithBorder),
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
