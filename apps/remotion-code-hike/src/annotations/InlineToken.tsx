import {
  AnnotationHandler,
  InnerToken,
} from "codehike/code";

export const inlineBlockTokens: AnnotationHandler = {
  name: "inline-block",
  Token: ({ ...props }) => (
    <InnerToken
      merge={props}
      style={{ display: "inline-block" }}
    />
  ),
};
