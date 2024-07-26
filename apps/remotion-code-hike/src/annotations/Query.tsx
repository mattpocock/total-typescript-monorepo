import clsx from "clsx";
import {
  InlineAnnotation,
  InnerLine,
  AnnotationHandler,
} from "codehike/code";
import {
  interpolate,
  useCurrentFrame,
} from "remotion";
import { DATA_NO_OVERRIDE_ATTRIBUTE } from "../constants";

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

const getLastLineOfError = (query: string) => {
  const lines = query.split("\n");
  return lines[lines.length - 1]?.trim();
};

export const makeQueryComponent =
  (outerProps: {
    type: "error" | "query";
    displayLength: number;
  }): AnnotationHandler["AnnotatedLine"] =>
  (props) => {
    const { annotation, indentation } = props;
    const { column, fromColumn, toColumn }: Data =
      annotation.data;
    const frame = useCurrentFrame();
    const opacity = interpolate(
      frame,
      [
        35,
        45,
        outerProps.displayLength - 10,
        outerProps.displayLength,
      ],
      [0, 1, 1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );

    const queryType = outerProps.type;

    return (
      <>
        <InnerLine merge={props} />
        {queryType === "error" && (
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
          {...{
            [DATA_NO_OVERRIDE_ATTRIBUTE]: "false",
          }}
          style={{
            opacity,
            minWidth: `${column + 2}ch`,
            maxWidth: 600,
            marginLeft: `${indentation}ch`,
            width: "fit-content",
            position: "relative",
            whiteSpace: "pre-wrap",
          }}
          className={clsx(
            {
              "border-l-8 border-red-500 rounded-l-none mt-3":
                queryType === "error",
              "bg-gray-700 text-gray-50 mt-2":
                queryType === "query",
            },
            "bg-gray-700 text-gray-50 rounded-xl p-4 px-6 font-mono",
          )}
        >
          {queryType === "query" && (
            <div
              style={{
                left: `${column - indentation - 0.5}ch`,
                position: "absolute",
                transform:
                  "rotate(45deg) translateY(-50%)",
                top: "-3px",
              }}
              className={clsx("bg-gray-700 size-4")}
            />
          )}
          {annotation.data.children ||
          queryType === "error"
            ? getLastLineOfError(annotation.query)
            : annotation.query}
        </div>
      </>
    );
  };
