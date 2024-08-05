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

export const htmlRendererFromFileUrlSchema = z.intersection(
  z.object({
    uri: z.string(),
    cacheBuster: z.string().optional(),
  }),
  renderTypeDiscriminatedUnionSchema,
);

export const htmlRendererFromCodeSchema = z.object({
  code: z.string(),
  lang: z.string(),
  renderType: z
    .enum([RENDER_TYPES.basicWithBorder, RENDER_TYPES.simpleNoBorder])
    .default(RENDER_TYPES.simpleNoBorder),
});

export type HTMLRendererSearchParams = z.input<
  typeof htmlRendererFromFileUrlSchema
>;

export type WSEvent = {
  type: "change";
  uri: string;
};

export type EncodedHTML = string & { __brand: "EncodedHTML" };

export type CodeSnippet = {
  encodedHtml: EncodedHTML;
  rawHtml: string;
};
