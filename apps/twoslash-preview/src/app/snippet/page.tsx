import { decompressFromEncodedURIComponent } from "lz-string";
import { snippetSchema } from "../../types";

export default async function Snippet(props: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { encodedHtml } = snippetSchema.parse(props.searchParams);
  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{
        __html: decompressFromEncodedURIComponent(encodedHtml) ?? "",
      }}
    ></div>
  );
}
