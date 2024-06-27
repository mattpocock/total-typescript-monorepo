import type { SubmitFunction } from "@remix-run/react";
import { assign, setup } from "xstate";

type Context = {
  currentSnippetIndex: number;
  chunks: Blob[];
  mediaRecorder?: MediaRecorder;
};

type Events =
  | {
      type: "RETURN";
    }
  | {
      type: "NEW_CHUNK";
      blob: Blob;
    }
  | {
      type: "ARROW_LEFT";
    }
  | {
      type: "ARROW_RIGHT";
    };

export const recordingMachine = (input: {
  codeSnippets: string[];
  submit: (file: File) => void;
}) =>
  setup({
    types: {} as {
      context: Context;
      events: Events;
    },
    guards: {
      isNotFirstSnippet: (x) => x.context.currentSnippetIndex > 0,
      isNotLastSnippet: (x) =>
        x.context.currentSnippetIndex < input.codeSnippets.length - 1,
    },
    actions: {
      submitChunks: (x) => {
        const blob = new Blob(x.context.chunks, {
          type: "audio/ogg; codecs=opus",
        });

        const file = new File([blob], "filename.ogg");
        input.submit(file);
      },
      stopRecorder: (x) => {
        x.context.mediaRecorder?.stop();
      },
      resetChunks: assign((x) => {
        return {
          chunks: [],
        };
      }),
      goToPrevSnippet: assign((x) => {
        return {
          currentSnippetIndex: x.context.currentSnippetIndex - 1,
        };
      }),
      goToNextSnippet: assign((x) => {
        return {
          currentSnippetIndex: x.context.currentSnippetIndex + 1,
        };
      }),
      goToFirstSnippet: assign((x) => {
        return {
          currentSnippetIndex: 0,
        };
      }),
      assignNewChunk: assign((x) => {
        return {
          chunks: [...x.context.chunks, (x.event as any).blob],
        };
      }),
    },
  }).createMachine({
    initial: "idle",
    context: {
      currentSnippetIndex: 0,
      chunks: [],
    },
    on: {
      ARROW_LEFT: {
        guard: "isNotFirstSnippet",
        actions: ["goToPrevSnippet"],
      },
      ARROW_RIGHT: {
        guard: "isNotLastSnippet",
        actions: "goToNextSnippet",
      },
      NEW_CHUNK: {
        actions: "assignNewChunk",
      },
    },
    states: {
      idle: {
        on: {
          RETURN: "recording",
        },
      },
      recording: {
        entry: ["goToFirstSnippet", "resetChunks"],
        exit: ["stopRecorder"],
        on: {
          RETURN: {
            target: "receivingFinalChunk",
          },
        },
      },
      receivingFinalChunk: {
        on: {
          NEW_CHUNK: {
            actions: ["assignNewChunk", "submitChunks"],
            target: "idle",
          },
        },
      },
      errored: {},
    },
  });
