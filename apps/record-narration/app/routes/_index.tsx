"use client";

import {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { createFileUploadHandler } from "@remix-run/node/dist/upload/fileUploadHandler";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { normalizeAudio } from "@total-typescript/ffmpeg";
import type { AbsolutePath } from "@total-typescript/shared";
import {
  transformCode,
  getLangFromCodeFence,
  getCodeSamplesFromFile,
} from "@total-typescript/twoslash-shared";
import { useMachine } from "@xstate/react";
import { useEffect, useMemo } from "react";
import { recordingMachine } from "~/recordingMachine";

export const meta: MetaFunction = () => {
  return [
    { title: "Narration Recorder" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const action = async (args: ActionFunctionArgs) => {
  const { copyFile, writeFile } = await import("fs/promises");

  const uploadHandler = unstable_composeUploadHandlers(
    createFileUploadHandler({
      directory: "public/uploads",
      maxPartSize: Infinity,
    }),
    unstable_createMemoryUploadHandler()
  );
  const formData = await unstable_parseMultipartFormData(
    args.request,
    uploadHandler
  );
  const markdownFilepath = formData.get("filepath") as AbsolutePath;
  const uploadedFile = formData.get("file") as unknown as {
    filepath: AbsolutePath;
  };

  const mkvFilepath = uploadedFile.filepath.replace(
    ".ogg",
    ".mkv"
  ) as AbsolutePath;

  await normalizeAudio(uploadedFile.filepath, mkvFilepath);

  const durations = (formData.get("durations") as string)
    .split(",")
    .map(Number);

  // const silence = await findSilenceInVideo(uploadedFile.filepath, {
  //   fps: 60,
  //   padding: PADDING,
  //   silenceDuration: SILENCE_DURATION,
  //   threshold: THRESHOLD,
  // });

  // const trimmedFilePath = uploadedFile.filepath.replace(
  //   ".ogg",
  //   ".trimmed.ogg",
  // ) as AbsolutePath;

  // console.log(JSON.stringify(silence, null, 2));

  // await trimVideo(
  //   uploadedFile.filepath,
  //   trimmedFilePath,
  //   silence.startTime,
  //   silence.endTime,
  // );

  const narrationLocation = markdownFilepath.replace(".md", ".narration.mkv");
  await copyFile(mkvFilepath, narrationLocation);
  const durationsLocation = markdownFilepath.replace(".md", ".meta.json");
  await writeFile(durationsLocation, JSON.stringify({ durations }, null, 2));

  return {};
};

export const loader = async () => {
  const { readFile } = await import("fs/promises");
  const { getActiveEditorFilePath } = await import("@total-typescript/shared");
  const activeFilePath = (await getActiveEditorFilePath())._unsafeUnwrap();

  // const activeFilePath =
  //   "/Users/matt/repos/ts/total-typescript-monorepo/apps/written-content/confusions/let-vs-const-inference/video.md";

  if (activeFilePath?.endsWith("md")) {
    const contents = await readFile(activeFilePath, "utf-8");

    const codeSnippets = getCodeSamplesFromFile(contents);

    const renderedCodeSnippets: string[] = [];

    for (const snippet of codeSnippets) {
      const shikiResult = await transformCode(snippet);

      if (shikiResult.success) {
        renderedCodeSnippets.push(shikiResult.codeHtml);
      } else {
        throw new Error(
          [
            `Failed to render code snippet in ${activeFilePath}`,
            shikiResult.title,
            shikiResult.description,
            shikiResult.recommendation,
          ].join("\n")
        );
      }
    }

    return {
      status: "success" as const,
      contents,
      codeSnippets: renderedCodeSnippets,
      path: activeFilePath,
    };
  } else {
    return {
      status: "not-markdown-file" as const,
      path: activeFilePath,
    };
  }
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const machine = useMemo(() => {
    return recordingMachine({
      codeSnippets: (data as any).codeSnippets,
      submit: ({ file, durations }) => {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("filepath", (data as any).path);
        formData.append("durations", durations.join(","));

        submit(formData, {
          method: "POST",
          encType: "multipart/form-data",
        });
      },
    });
  }, []);

  const [state, send] = useMachine(machine);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        send({
          type: "ARROW_RIGHT",
        });
      } else if (e.key === "ArrowLeft") {
        send({
          type: "ARROW_LEFT",
        });
      } else if (e.key === "Enter") {
        send({
          type: "RETURN",
        });
      }
    };

    addEventListener("keydown", listener);

    return () => {
      removeEventListener("keydown", listener);
    };
  }, []);

  useEffect(() => {
    if (!state.matches("recording")) {
      return;
    }

    let mediaRecorder: MediaRecorder;
    let stream: MediaStream;

    navigator.mediaDevices
      .getUserMedia({
        audio: {
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
        },
      })
      .then((s) => {
        stream = s;
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
          send({
            type: "NEW_CHUNK",
            blob: e.data,
          });
        };

        mediaRecorder.start();
      });

    return () => {
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
      mediaRecorder?.stop();
    };
  }, [state.matches("recording")]);

  if (data.status === "not-markdown-file") {
    return (
      <div>
        <h1>Not a markdown file</h1>
        <code>{data.path}</code> is not a markdown file.
      </div>
    );
  }
  const currentSnippet = data.codeSnippets[state.context.currentSnippetIndex]!;
  const nextSnippet = data.codeSnippets[state.context.currentSnippetIndex + 1];

  const percentComplete = Math.ceil(
    (state.context.currentSnippetIndex / (data.codeSnippets.length - 1)) * 100
  );

  return (
    <>
      <div className="h-1 w-full">
        <div
          className="bg-blue-500 h-full"
          style={{
            width: `${percentComplete}%`,
            transition: "width 0.3s",
          }}
        />
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col space-y-4">
            <h1 className="text-2xl">Current</h1>
            <div
              dangerouslySetInnerHTML={{
                __html: currentSnippet,
              }}
            ></div>
          </div>
          <div className="flex flex-col space-y-4">
            {nextSnippet && (
              <>
                <h1 className="text-2xl">Next</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: nextSnippet,
                  }}
                ></div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 mb-8 flex justify-center w-full">
        <div className="px-6 py-4 pb-5 rounded-xl bg-gray-100 space-x-8 flex items-center">
          <div>
            <code className="font-medium text-gray-900">LEFT</code>
            <p className="text-xs text-gray-500">Prev slide</p>
          </div>
          <div>
            <code className="font-medium text-gray-900">RIGHT</code>
            <p className="text-xs text-gray-500">Next slide</p>
          </div>
          <div>
            <code
              className={`font-medium ${state.matches("recording") ? "text-red-500" : "text-gray-900"}`}
            >
              RETURN
            </code>
            <p
              className={`text-xs ${state.matches("recording") ? "text-red-400" : "text-gray-500"}`}
            >
              Record
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
