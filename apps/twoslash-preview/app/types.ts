import { z } from "zod";

export const RENDER_TYPES = {
  simpleNoBorder: "basic",
  basicWithBorder: "basic-with-border",
  allBasicWithBorder: "all-basic-with-border",
  allSquareWithBorder: "all-square-with-border",
  error: "error",
} as const;

export type RenderType = (typeof RENDER_TYPES)[keyof typeof RENDER_TYPES];

export const RENDER_TYPE_HUMAN_READABLE_NAMES = {
  allSquareWithBorder: "Square with Border (Single Image)",
  basicWithBorder: "Simple with Border",
  allBasicWithBorder: "Simple with Border (Single Image)",
  error: "Error",
  simpleNoBorder: "Simple",
} satisfies Record<keyof typeof RENDER_TYPES, string>;

const indexSchema = z
  .string()
  .transform((x) => Number(x))
  .pipe(z.number().int().min(0));

export const renderTypeDiscriminatedUnionSchema = z.union([
  z.object({
    mode: z.literal(RENDER_TYPES.allSquareWithBorder),
  }),
  z.object({
    mode: z.literal(RENDER_TYPES.basicWithBorder),
    snippetIndex: indexSchema,
  }),
  z.object({
    mode: z.literal(RENDER_TYPES.allBasicWithBorder),
  }),
  z.object({
    mode: z.literal(RENDER_TYPES.simpleNoBorder),
    snippetIndex: indexSchema,
  }),
]);

export const htmlRendererSchema = z.intersection(
  z.object({
    uri: z.string(),
    cacheBuster: z.string().optional(),
  }),
  renderTypeDiscriminatedUnionSchema,
);

export type HTMLRendererSearchParams = z.input<typeof htmlRendererSchema>;
