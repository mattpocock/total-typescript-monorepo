import lzString from "lz-string";
import { NextApiHandler } from "next";
import { z } from "zod";
import { createUrl } from "../../app/createUrl";
import { applyShiki } from "../../cli/applyShiki";

const prop =
  <TKey extends PropertyKey>(key: TKey) =>
  <T extends Record<TKey, any>>(obj: T) =>
    obj[key];

const query = z.object({
  link: z
    .string()
    .describe("The link to the TypeScript Playground snippet")
    .transform((link) => {
      const url = new URL(link);
      return lzString.decompressFromEncodedURIComponent(url.hash.slice(6));
    })
    .transform((code) => {
      return ["```tsx twoslash", code.trim(), "```"].join("\n");
    }),
});
const handler: NextApiHandler = async (req, res) => {
  const result = await query.safeParseAsync(req.query);

  if (!result.success) {
    return res.status(400).json(result.error);
  }

  const { link: markdownCodeSample } = result.data;

  try {
    const { html } = await applyShiki(markdownCodeSample);

    const encodedHtml = lzString.compressToEncodedURIComponent(html);

    const url = createUrl("/api/code-snippet-image", {
      mode: "square",
      encodedHtml,
      index: "0",
    });

    res.redirect(url);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export default handler;
