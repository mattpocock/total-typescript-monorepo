"use client";
import { allSquareSnippetSchema } from "../../../types";
import { CodeSnippet, ScreenshotSnippetWrapper } from "../../components";

export default function Snippet(props: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { snippets, index } = allSquareSnippetSchema.parse(props.searchParams);

  return (
    <ScreenshotSnippetWrapper outerClassName="aspect-[1/1.91]" index={index}>
      {snippets.map((snippet, key) => {
        return <CodeSnippet html={snippet} key={key} />;
      })}
    </ScreenshotSnippetWrapper>
  );
}
