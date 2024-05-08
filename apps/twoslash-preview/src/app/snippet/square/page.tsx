"use client";
import { decompressFromEncodedURIComponent } from "lz-string";
import { snippetSchema } from "../../../types";
import { CodeSnippet, ScreenshotSnippetWrapper } from "../../components";

export default function Page(props: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { encodedHtml, index } = snippetSchema.parse(props.searchParams);

  return (
    <ScreenshotSnippetWrapper outerClassName="aspect-square" index={index}>
      <CodeSnippet html={decompressFromEncodedURIComponent(encodedHtml)} />
    </ScreenshotSnippetWrapper>
  );
}
