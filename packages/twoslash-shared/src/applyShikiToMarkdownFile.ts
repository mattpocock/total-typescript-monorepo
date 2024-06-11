import {
  applyShikiToCode,
  type CodeSnippet,
  type EncodedHTML,
} from "@total-typescript/twoslash-shared";
import lzString from "lz-string";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { codeToHtml, getHighlighter } from "shiki";
import { unified } from "unified";

const visitNodes = async (
  node: any,
  predicate: (node: any) => boolean,
  transform: (node: any) => any,
) => {
  if (predicate(node)) {
    await transform(node);
  }

  if (node.children) {
    for (const child of node.children) {
      await visitNodes(child, predicate, transform);
    }
  }
};

const codeToHtmlPolymorphic = async (opts: {
  code: string;
  lang: string;
  isTwoslash: boolean;
}): Promise<string> => {
  const { code, lang, isTwoslash } = opts;

  if (isTwoslash) {
    const result = await applyShikiToCode({
      code,
      lang,
    });

    if (result.success) {
      return result.html;
    } else {
      throw new Error(result.title);
    }
  } else {
    return await codeToHtml(code, {
      lang,
      theme: "dark-plus",
    });
  }
};

const processor = (pushSnippet: (snippet: CodeSnippet) => void) =>
  unified()
    .use(remarkParse)
    .use({
      plugins: [
        () => async (rootNode) => {
          await getHighlighter({
            langs: [
              "ts",
              "tsx",
              "js",
              "jsx",
              "typescript",
              "javascript",
              "json",
              "html",
            ],
            themes: ["dark-plus"],
          });
          await visitNodes(
            rootNode,
            (node) => {
              return node.type === "code";
            },
            async (node) => {
              console.log(node);

              const code = node.value;
              const lang = node.lang;
              const isTwoslash = node.meta?.includes("twoslash") ?? false;

              const html = await codeToHtmlPolymorphic({
                code,
                lang,
                isTwoslash,
              });

              pushSnippet({
                rawHtml: lzString.compressToEncodedURIComponent(
                  html,
                ) as EncodedHTML,
              });

              node.type = "html";
              node.value = html;
              node.children = [];
            },
          );
        },
      ],
    })
    .use(remarkRehype)
    .use({
      plugins: [
        () => (rootNode) => {
          (rootNode.children || []).forEach((child: any) => {
            if (
              child.tagName === "pre" &&
              Array.isArray(child.properties.class)
            ) {
              child.properties.class.push("not-prose");
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

  console.log(result.value);

  return {
    html: result.toString(),
    snippets,
  };
};
