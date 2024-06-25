import { transcribeAudio } from "./transcribeAudio.js";

const transcriber = transcribeAudio({
  onTranscriptionChange: console.log,
});

process.on("beforeExit", () => {
  transcriber.close();
});
