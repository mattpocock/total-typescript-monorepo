import {
  AnnotationHandler,
  InlineAnnotation,
} from "codehike/code";
import {
  makeQueryComponent,
  transformQuery,
} from "./Query";

export const errorCallout: AnnotationHandler = {
  name: "error-callout",
  transform: transformQuery,
  AnnotatedLine: makeQueryComponent("error"),
};
