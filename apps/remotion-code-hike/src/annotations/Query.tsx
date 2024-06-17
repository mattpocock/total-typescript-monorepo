import clsx from "clsx";
import {
  InlineAnnotation,
  LineAnnotationComponent,
} from "codehike/code";
import {
  interpolate,
  useCurrentFrame,
} from "remotion";

type Data = {
  column: number;
  fromColumn: number;
  toColumn: number;
};

export const transformQuery = (
  annotation: InlineAnnotation,
) => {
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
      column: (fromColumn + toColumn) / 2,
      fromColumn,
      toColumn,
    } satisfies Data,
  };
};

export const makeQueryComponent =
  (type: "error" | "query"): LineAnnotationComponent =>
  ({
    InnerLine,
    annotation,
    indentation,
    ...props
  }) => {
    const { column, fromColumn, toColumn }: Data =
      annotation.data;
    const frame = useCurrentFrame();
    const opacity = interpolate(
      frame,
      [35, 45],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );

    return (
      <>
        <InnerLine {...props} />
        {type === "error" && (
          <div
            className="h-2 bg-red-500 absolute -mt-2"
            style={{
              opacity,
              marginLeft: `${fromColumn}ch`,
              width: `${toColumn - fromColumn}ch`,
            }}
          ></div>
        )}
        <div
          style={{
            opacity,
            minWidth: `${column + 2}ch`,
            marginLeft: `${indentation}ch`,
            width: "fit-content",
            position: "relative",
            whiteSpace: "pre-wrap",
          }}
          className={clsx(
            {
              "border-l-8 border-red-500 rounded-l-none mt-3":
                type === "error",
              "bg-gray-700 text-gray-50 mt-2":
                type === "query",
            },
            "bg-gray-700 text-gray-50 rounded-xl p-4 px-6 font-mono",
          )}
        >
          {type === "query" && (
            <div
              style={{
                left: `${column - indentation - 0.5}ch`,
                position: "absolute",
                transform:
                  "rotate(45deg) translateY(-50%)",
                top: "-3px",
              }}
              className={clsx(
                {
                  "bg-red-900": type === "error",
                  "bg-gray-700": type === "query",
                },
                "bg-gray-700 size-4",
              )}
            />
          )}
          {annotation.data.children ||
            annotation.query}
        </div>
      </>
    );
  };
