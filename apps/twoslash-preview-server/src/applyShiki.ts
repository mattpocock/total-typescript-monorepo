import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { CodeSnippet, EncodedHTML } from "./types.js";
import lzString from "lz-string";
import { writeFileSync } from "fs";
import { toHtml } from "hast-util-to-html";
import { transformerTwoslash } from "@shikijs/twoslash";

const visitNodes = (
  node: any,
  type: string,
  transformer: (node: {
    type: "code";
    lang: string;
    meta: string;
    value: string;
  }) => void,
) => {
  console.log(node);
  if (node.type === type) {
    transformer(node);
  }

  if (node.children) {
    for (const child of node.children) {
      visitNodes(child, type, transformer);
    }
  }
};

export const applyShiki = (() => {
  const processor = (pushSnippet: (snippet: CodeSnippet) => void) =>
    unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeShiki, {
        // or `theme` for a single theme
        theme: "dark-plus",
        transformers: [
          transformerTwoslash({
            langs: ["typescript", "tsx", "ts", "json"],
            throws: true,
            explicitTrigger: true,
          }),
        ],
      })
      .use({
        plugins: [
          () => (node) => {
            (node.children || []).forEach((child: any) => {
              if (
                child.tagName === "pre" &&
                Array.isArray(child.properties.class)
              ) {
                child.properties.class.push("not-prose");

                try {
                  const html = toHtml(child);

                  pushSnippet({
                    rawHtml: lzString.compressToEncodedURIComponent(
                      html,
                    ) as EncodedHTML,
                  });
                } catch (e) {}
              }
            });
          },
        ],
      })
      .use(rehypeStringify);

  const run = async (markdown: string) => {
    const snippets: CodeSnippet[] = [];

    const result = await processor((snippet) => snippets.push(snippet)).process(
      markdown,
    );

    return {
      html: result.toString(),
      snippets,
    };
  };

  return run;
})();
