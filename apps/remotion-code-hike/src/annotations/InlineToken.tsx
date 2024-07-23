import { AnnotationHandler } from "codehike/code";

export const inlineBlockTokens: AnnotationHandler = {
  name: "inline-block",
  // @ts-ignore
  Token: ({ InnerToken, ...props }) => (
    <InnerToken
      merge={props}
      style={{ display: "inline-block" }}
    />
  ),
};
