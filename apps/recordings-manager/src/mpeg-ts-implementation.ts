import chokidar from "chokidar";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import readline from "readline";
import { env } from "@total-typescript/env";
import { SILENCE_DURATION, THRESHOLD } from "@total-typescript/ffmpeg";

// CONFIGURATION
const WATCH_DIR = env.OBS_OUTPUT_DIRECTORY; // Directory to watch for new .ts files
const AUDIO_SEGMENT_SECONDS = 10; // Length of audio segments for silence detection/transcription

// State
let currentFile: string | null = null;
let fileStream: fs.ReadStream | null = null;
let filePosition = 0;
let clipLog: { start: number; end: number; transcript: string }[] = [];
let processing = false;
let lastProcessedEnd = 0; // Track the end of the last processed segment

// Utility: Sleep
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// 1. Watch for new .ts files
chokidar
  .watch(`${WATCH_DIR}`, {
    ignoreInitial: true,
    usePolling: true,
    interval: 200,
  })
  .on("add", (filePath: string) => {
    if (filePath.endsWith(".ts")) {
      console.log(`New recording detected: ${filePath}`);
      if (currentFile) {
        console.log(
          "Already processing a file. Please stop the previous recording first."
        );
        return;
      }
      currentFile = filePath;
      filePosition = 0;
      clipLog = [];
      lastProcessedEnd = 0;
      tailFile(filePath);
    }
  });

// 2. Tail the growing .ts file with rolling buffer
async function tailFile(filePath: string) {
  processing = true;
  const tempTsPath = path.join(WATCH_DIR, "temp-segment.ts");
  const tempAudioPath = tempTsPath.replace(".ts", ".wav");
  // Ensure temp files are clean
  if (fs.existsSync(tempTsPath)) fs.unlinkSync(tempTsPath);
  if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);

  while (processing) {
    const stats = fs.statSync(filePath);
    if (stats.size > filePosition) {
      const readSize = stats.size - filePosition;
      const buffer = Buffer.alloc(readSize);
      const fd = fs.openSync(filePath, "r");
      fs.readSync(fd, buffer, 0, readSize, filePosition);
      fs.closeSync(fd);
      filePosition += readSize;
      // Append new data to temp .ts file
      fs.appendFileSync(tempTsPath, buffer);
      // Extract audio from the growing .ts file (overwrite temp audio)
      await extractAudioRolling(tempTsPath, tempAudioPath);
      // Process new speech segments
      await processNewAudio(tempAudioPath);
    }
    await sleep(300); // Small delay to avoid busy-waiting
  }
}

// Extract audio from TS segment using ffmpeg (overwrite mode)
async function extractAudioRolling(tsPath: string, audioPath: string) {
  await runFFmpeg([
    "-y",
    "-i",
    tsPath,
    "-vn",
    "-acodec",
    "pcm_s16le",
    "-ar",
    "16000",
    "-ac",
    "1",
    audioPath,
  ]);
}

// Process new audio for unprocessed speech segments
async function processNewAudio(audioPath: string) {
  const segments = await detectSilence(audioPath);
  for (const seg of segments) {
    if (seg.end > lastProcessedEnd) {
      const start = Math.max(seg.start, lastProcessedEnd);
      const transcript = await transcribeWithWhisper(audioPath, start, seg.end);
      clipLog.push({ start, end: seg.end, transcript });
      lastProcessedEnd = seg.end;
    }
  }
}

// Remove chunk-based logic from processNewData
async function processNewData(buffer: Buffer) {
  // No longer used; logic moved to tailFile
}

// Run ffmpeg command
function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", args);
    // ffmpeg.stderr.on("data", (data) => process.stderr.write(data));
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

// 5. Detect silence (using ffmpeg's silencedetect)
async function detectSilence(
  audioPath: string
): Promise<{ start: number; end: number }[]> {
  const segments: { start: number; end: number }[] = [];
  let lastSilenceEnd = 0;
  let currentSilenceStart: number | null = null;
  const duration = await getAudioDuration(audioPath);

  await new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      audioPath,
      "-af",
      `silencedetect=n=${THRESHOLD}dB:d=${SILENCE_DURATION}`,
      "-f",
      "null",
      "-",
    ]);

    ffmpeg.stderr.on("data", (data) => {
      const output = data.toString();
      const lines = output.split("\n");
      for (const line of lines) {
        const silenceStartMatch = line.match(/silence_start: ([\d.]+)/);
        if (silenceStartMatch) {
          currentSilenceStart = parseFloat(silenceStartMatch[1]);
          if (lastSilenceEnd < currentSilenceStart) {
            // Speech segment between lastSilenceEnd and currentSilenceStart
            segments.push({ start: lastSilenceEnd, end: currentSilenceStart });
          }
        }
        const silenceEndMatch = line.match(/silence_end: ([\d.]+)/);
        if (silenceEndMatch) {
          lastSilenceEnd = parseFloat(silenceEndMatch[1]);
        }
      }
    });

    ffmpeg.on("close", () => {
      resolve();
    });
    ffmpeg.on("error", reject);
  });

  // If there's speech after the last silence
  if (lastSilenceEnd < duration) {
    segments.push({ start: lastSilenceEnd, end: duration });
  }
  // Filter out zero-length or negative segments
  return segments.filter((seg) => seg.end > seg.start);
}

// Get audio duration using ffprobe
function getAudioDuration(audioPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      audioPath,
    ]);
    let output = "";
    ffprobe.stdout.on("data", (data) => (output += data));
    ffprobe.on("close", () => {
      resolve(parseFloat(output));
    });
  });
}

// 6. Transcribe with Whisper (placeholder)
async function transcribeWithWhisper(
  audioPath: string,
  start: number,
  end: number
): Promise<string> {
  // In production, call Whisper CLI or API with segment
  // Here, just return a dummy transcript
  return `Transcript for ${audioPath}`;
}

// 9. On recording end, process remaining data
process.on("SIGINT", async () => {
  console.log("\nRecording stopped. Finalizing...");
  processing = false;
  if (currentFile) {
    // Process any remaining data
    // (In production, flush buffers and process last segment)
    console.log("Clip log:", clipLog);
    // 10. Export clips (optional, not implemented here)
    // exportClips(currentFile, clipLog);
  }
  process.exit(0);
});

// 8. Basic terminal UI (placeholder)
console.log("Watching for new .ts recordings in", WATCH_DIR);
console.log("Press Ctrl+C to stop and finalize.");
