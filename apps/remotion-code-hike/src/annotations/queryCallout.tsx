import {
  InlineAnnotation,
  AnnotationHandler,
} from "codehike/code";
import {
  interpolate,
  useCurrentFrame,
} from "remotion";

export const queryCallout: AnnotationHandler = {
  name: "query-callout",
  transform: (annotation: InlineAnnotation) => {
    const {
      name,
      query,
      lineNumber,
      fromColumn,
      toColumn,
      data,
    } = annotation;
    return {
      name,
      query,
      fromLineNumber: lineNumber,
      toLineNumber: lineNumber,
      data: {
        ...data,
        column: (fromColumn + toColumn) / 2,
      },
    };
  },
  AnnotatedLine: ({
    InnerLine,
    annotation,
    indentation,
    ...props
  }) => {
    const { column } = annotation.data;
    const frame = useCurrentFrame();
    const opacity = interpolate(
      frame,
      [25, 35],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
    return (
      <>
        <InnerLine {...props} />
        <div
          style={{
            opacity,
            minWidth: `${column + 4}ch`,
            marginLeft: `${indentation}ch`,
            width: "fit-content",
            border: "1px solid #aaa",
            backgroundColor: "#171717",
            borderRadius: "0.25rem",
            padding: "1rem",
            position: "relative",
            marginTop: "0.25rem",
            whiteSpace: "pre-wrap",
            color: "#fafafa",
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              left: `${column - indentation - 0.5}ch`,
              position: "absolute",
              borderLeft: "2px solid #888",
              borderTop: "2px solid #888",
              width: "1rem",
              height: "1rem",
              transform:
                "rotate(45deg) translateY(-50%)",
              top: "-3px",
              backgroundColor: "#171717",
            }}
          />
          {annotation.data.children ||
            annotation.query}
        </div>
      </>
    );
  },
};
