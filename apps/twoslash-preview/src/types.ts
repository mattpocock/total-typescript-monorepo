import { decompressFromEncodedURIComponent } from "lz-string";
import { z } from "zod";

export type Routes = {
  "/api/code-snippet-image": CodeSnippetImageSchema;
  "/snippet/square": SnippetSchema;
  "/snippet": SnippetSchema;
  "/snippet/all-square": SnippetSchema;
  "/snippet/vertical-phone": SnippetSchema;
};

export const codeSnippetImageSchema = z.object({
  encodedHtml: z.string(),
  mode: z.enum(["square", "basic", "all-square", "vertical"]),
  index: z.string(),
});

export type CodeSnippetImageSchema = z.infer<typeof codeSnippetImageSchema>;

export const snippetSchema = z.object({
  encodedHtml: z.string(),
  index: z.string(),
});

export const allSquareSnippetSchema = z
  .object({
    index: z.string(),
    encodedHtml: z
      .string()
      .transform((s) => s.split(","))
      .pipe(z.array(z.string().transform(decompressFromEncodedURIComponent))),
  })
  .transform((data) => ({
    ...data,
    snippets: data.encodedHtml,
  }));

export type SnippetSchema = z.infer<typeof snippetSchema>;
