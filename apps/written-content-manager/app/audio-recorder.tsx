import { useMachine } from "@xstate/react";
import { useEffect, useMemo, type ButtonHTMLAttributes } from "react";
import { recordingMachine } from "./recording-machine";

interface AudioRecorderProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  onComplete: (file: File) => void;
}

export const AudioRecorder = ({ onComplete, ...props }: AudioRecorderProps) => {
  const machine = useMemo(() => {
    return recordingMachine({
      submit: ({ file }) => {
        onComplete(file);
      },
    });
  }, []);

  const [state, send] = useMachine(machine);

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

  return (
    <button {...props} onClick={() => send({ type: "RECORD_TOGGLE_CLICKED" })}>
      {state.matches("idle") ? "Record" : null}
      {state.matches("recording") || state.matches("receivingFinalChunk")
        ? "Stop"
        : null}
      {state.matches("errored") ? "An Error Occurred" : null}
    </button>
  );
};
