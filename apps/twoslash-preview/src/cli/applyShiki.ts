import { CodeSnippet, EncodedHTML } from "../types";
import { compressToEncodedURIComponent } from "lz-string";
import { remark } from "remark";
import remarkHtml, { Options as RemarkHtmlOptions } from "remark-html";
import remarkTwoslashPlugin, { Options } from "remark-shiki-twoslash";

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
  let snippets: CodeSnippet[] = [];

  const processor = remark()
    .use({
      plugins: [
        [
          remarkTwoslashPlugin,
          {
            theme: "dark-plus",
            langs: ["typescript", "tsx", "ts", "json"],
          } satisfies Options,
        ],
      ],
    } as any)
    .use({
      plugins: [
        () => (node) => {
          visitNodes(
            node,
            "html",
            (child: { lang: string; meta: string; value: string }) => {
              snippets.push({
                rawHtml: compressToEncodedURIComponent(
                  child.value,
                ) as EncodedHTML,
              });
            },
          );
        },
      ],
    })
    .use(remarkHtml as any, { sanitize: false } satisfies RemarkHtmlOptions);

  const run = async (markdown: string) => {
    snippets = [];

    const result = await processor.process(markdown);

    return {
      html: result.toString(),
      snippets,
    };
  };

  return run;
})();
