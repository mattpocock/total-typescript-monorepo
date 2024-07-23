import rehypeShiki from "@shikijs/rehype";
import { rendererClassic, transformerTwoslash } from "@shikijs/twoslash";
import type {
  CodeSnippet,
  EncodedHTML,
} from "@total-typescript/twoslash-shared";
import { toHtml } from "hast-util-to-html";
import lzString from "lz-string";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

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
          renderer: rendererClassic(),
        }),
      ],
    })
    .use({
      plugins: [
        () => (rootNode) => {
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

export const applyShikiToMarkdownFile = async (markdown: string) => {
  const snippets: CodeSnippet[] = [];

  const result = await processor((snippet) => snippets.push(snippet)).process(
    markdown,
  );

  return {
    html: result.toString(),
    snippets,
  };
};
