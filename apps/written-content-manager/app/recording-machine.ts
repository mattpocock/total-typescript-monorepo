import { assign, setup } from "xstate";

type Context = {
  chunks: Blob[];
  mediaRecorder?: MediaRecorder;
};

type Events =
  | {
      type: "RECORD_TOGGLE_CLICKED";
    }
  | {
      type: "NEW_CHUNK";
      blob: Blob;
    };

export const recordingMachine = (input: {
  submit: (contents: { file: File }) => void;
}) =>
  setup({
    types: {} as {
      context: Context;
      events: Events;
    },
    actions: {
      submitChunks: (x) => {
        const blob = new Blob(x.context.chunks, {
          type: "audio/ogg; codecs=opus",
        });

        const file = new File([blob], "filename.ogg");

        input.submit({ file });
      },
      stopRecorder: (x) => {
        x.context.mediaRecorder?.stop();
      },
      resetChunks: assign((x) => {
        return {
          chunks: [],
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
      chunks: [],
    },
    on: {
      NEW_CHUNK: {
        actions: "assignNewChunk",
      },
    },
    states: {
      idle: {
        on: {
          RECORD_TOGGLE_CLICKED: "recording",
        },
      },
      recording: {
        entry: ["resetChunks"],
        exit: ["stopRecorder"],
        on: {
          RECORD_TOGGLE_CLICKED: {
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
