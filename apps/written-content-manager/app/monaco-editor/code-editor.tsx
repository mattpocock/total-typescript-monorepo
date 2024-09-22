import Editor from "@monaco-editor/react";
import { type ChangeEvent, type ComponentProps, useRef, useState } from "react";
import { prettierLoader } from "./prettier-loader";
import clsx from "clsx";

type Editor = Parameters<
  NonNullable<ComponentProps<typeof Editor>["onMount"]>
>[0];

type Monaco = Parameters<
  NonNullable<ComponentProps<typeof Editor>["onMount"]>
>[1];

const resolveLanguage = (language: Language): string => {
  switch (language) {
    case "ts":
      return "typescript";
    case "js":
      return "javascript";

    case "md":
      return "markdown";
    default:
      return language;
  }
};

export type Language = "ts" | "tsx" | "md" | "json" | "js";

const THEME_NAME = "total-typescript";

const EDITOR_THEME = {
  base: "vs" as const,
  inherit: true,
  rules: [],
  name: THEME_NAME,
};

export type CodeEditorProps = {
  name: string;
  label: string;
  onChange?: (value: string | undefined) => void;
  language: Language;
  defaultValue: string | null | undefined;
  className?: string;
  fontSize?: number;
  readonly?: boolean;
};

let incrementable = 0;

/**
 * Eagerly loaded code editor
 *
 * This should not be used directly, instead use ./lazy-loaded-editor.tsx
 */
export const EagerlyLoadedEditor = (props: CodeEditorProps) => {
  // Needs to be a different file name for each editor on-screen
  const [path] = useState(() => {
    incrementable++;
    return `main-${incrementable}.${props.language}`;
  });

  const monacoRef = useRef<Monaco | undefined>(undefined);
  const editorRef = useRef<Editor | undefined>(undefined);

  const [value, setValue] = useState<string | undefined>(
    props.defaultValue ?? ""
  );

  return (
    <div className={props.className}>
      <label className="mb-2 block text-sm">{props.label}</label>
      <input type="hidden" name={props.name} value={value} />
      <div className={clsx("border-gray-200 border-2")}>
        <Editor
          path={path}
          loading={<div>Loading Code Editor...</div>}
          height={"300px"}
          value={value}
          onChange={(value) => {
            setValue(value);
            props.onChange?.(value);
          }}
          language={resolveLanguage(props.language)}
          theme="vs"
          options={{
            minimap: { enabled: false, showSlider: "mouseover" },
            fontSize: props.fontSize ?? 16,
            glyphMargin: false,
            tabSize: 2,
            lineNumbers: "off",
            scrollbar: {
              vertical: "hidden",
              horizontal: "auto",
            },
            padding: { top: 24, bottom: 24 },
            automaticLayout: true,
            readOnly: props.readonly,
            scrollBeyondLastLine: true,
            wordWrap: "on",
          }}
          onMount={(editor, monaco) => {
            monacoRef.current = monaco;
            editorRef.current = editor;

            // Enable prettier
            monaco.languages.registerDocumentFormattingEditProvider(
              "typescript",
              {
                provideDocumentFormattingEdits: async (model) => {
                  try {
                    return [
                      {
                        text: await prettierLoader.formatTypeScript(
                          model.getValue()
                        ),
                        range: model.getFullModelRange(),
                      },
                    ];
                  } catch (err) {
                    console.error(err);
                  }
                },
              }
            );

            monaco.languages.registerDocumentFormattingEditProvider(
              "markdown",
              {
                provideDocumentFormattingEdits: async (model) => {
                  try {
                    return [
                      {
                        text: await prettierLoader.formatMarkdown(
                          model.getValue()
                        ),
                        range: model.getFullModelRange(),
                      },
                    ];
                  } catch (err) {
                    console.error(err);
                  }
                },
              }
            );

            // Adjust the compiler options
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
              ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
              module: monaco.languages.typescript.ModuleKind.ESNext,
              moduleResolution:
                monaco.languages.typescript.ModuleResolutionKind.NodeJs,
              strict: true,
            });

            // Enable auto formatting on save
            editor.addAction({
              id: "save",
              label: "Save",
              keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
              run: () => {
                console.log("SAVING");

                editor.getAction("editor.action.formatDocument")?.run(path);
              },
            });
          }}
        />
      </div>
    </div>
  );
};
