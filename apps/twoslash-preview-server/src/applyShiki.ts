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
  predicate: (node: any) => boolean,
  transform: (node: any) => void,
) => {
  if (predicate(node)) {
    transform(node);
  }

  if (node.children) {
    for (const child of node.children) {
      visitNodes(child, predicate, transform);
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
        langs: ["typescript", "tsx", "ts", "json"],
        transformers: [
          transformerTwoslash({
            throws: true,
            explicitTrigger: true,
          }),
        ],
      })
      .use({
        plugins: [
          () => (rootNode) => {
            writeFileSync("node.json", JSON.stringify(rootNode, null, 2));

            visitNodes(
              rootNode,
              (node) => {
                return (
                  node.type === "element" &&
                  node.tagName === "span" &&
                  node.properties?.class?.includes(
                    "twoslash-query-presisted",
                  ) &&
                  node?.children?.[0]?.properties?.class ===
                    "twoslash-popup-container"
                );
              },
              (node) => {
                console.log(node);
                const containerNode = node.children[0];

                (node.children as any[]).splice(0, 1);
              },
            );

            visitNodes(
              rootNode,
              (node) =>
                node.type === "element" &&
                node.tagName === "pre" &&
                node?.properties?.style,
              (node) => {
                delete node.properties.style;
              },
            );

            (rootNode.children || []).forEach((child: any) => {
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
