import {
  InlineAnnotation,
  AnnotationHandler,
} from "codehike/code";
import {
  interpolate,
  useCurrentFrame,
} from "remotion";
import {
  makeQueryComponent,
  transformQuery,
} from "./Query";

export const queryCallout: AnnotationHandler = {
  name: "query-callout",
  transform: transformQuery,
  AnnotatedLine: makeQueryComponent("query"),
};
