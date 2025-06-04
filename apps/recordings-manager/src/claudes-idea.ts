import { spawn, ChildProcess } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import {
  AUTO_EDITED_START_PADDING,
  AUTO_EDITED_END_PADDING,
  SILENCE_DURATION,
  THRESHOLD as SILENCE_THRESHOLD,
  MINIMUM_CLIP_LENGTH_IN_SECONDS as MIN_CLIP_DURATION,
} from "@total-typescript/ffmpeg";

interface SpeechSegment {
  start: number;
  end: number;
  duration: number;
}

let recordProcess: ChildProcess | null = null;
let detectProcess: ChildProcess | null = null;
let currentSpeechStart: number | null = null;
let speechSegments: SpeechSegment[] = [];

const RTMP_URL = "rtmp://localhost:1935";
const CLIPS_DIR = "clips";
const TEMP_FILE = "temp_stream.ts"; // Using .ts format for better streaming

async function ensureClipsDirectory(): Promise<void> {
  try {
    await fs.access(CLIPS_DIR);
  } catch {
    await fs.mkdir(CLIPS_DIR, { recursive: true });
  }
}

function getCurrentTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, "").replace("T", "_").slice(0, 15);
}

function parseTimestamp(line: string, pattern: string): number | null {
  const regex = new RegExp(`${pattern}: ([\\d.]+)`);
  const match = line.match(regex);
  return match ? parseFloat(match[1]!) : null;
}

async function extractSpeechClip(start: number, end: number): Promise<void> {
  // Apply padding from constants
  const paddedStart = Math.max(0, start - AUTO_EDITED_START_PADDING);
  const paddedEnd = end + AUTO_EDITED_END_PADDING;
  const duration = paddedEnd - paddedStart;
  if (duration < MIN_CLIP_DURATION) {
    console.log(`Skipping short clip: ${duration.toFixed(1)}s`);
    return;
  }

  const timestamp = getCurrentTimestamp();
  const outputFile = path.join(
    CLIPS_DIR,
    `speech_${timestamp}_${paddedStart.toFixed(1)}-${paddedEnd.toFixed(1)}.mp4`
  );

  console.log(
    `Extracting speech clip: ${paddedStart.toFixed(1)}s - ${paddedEnd.toFixed(1)}s (${duration.toFixed(1)}s)`
  );

  // Wait a moment to ensure the recording has the data
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const extractArgs = [
    "-y",
    "-hide_banner",
    "-i",
    TEMP_FILE,
    "-ss",
    paddedStart.toString(),
    "-t",
    duration.toString(),
    "-avoid_negative_ts",
    "make_zero",
    "-c:v",
    "h264_nvenc",
    "-preset",
    "slow",
    "-rc:v",
    "vbr",
    "-cq:v",
    "19",
    "-b:v",
    "8000k",
    "-maxrate",
    "12000k",
    "-bufsize",
    "16000k",
    "-c:a",
    "aac",
    "-b:a",
    "384k",
    outputFile,
  ];

  return new Promise((resolve, reject) => {
    const extractProcess = spawn("ffmpeg", extractArgs);

    let hasOutput = false;
    extractProcess.stderr.on("data", (data) => {
      const output = data.toString();
      if (output.includes("time=")) {
        hasOutput = true;
      }
      if (output.includes("error") || output.includes("Error")) {
        console.error("Extract error:", output);
      }
    });

    extractProcess.on("close", (code) => {
      if (code === 0 && hasOutput) {
        console.log(`✓ Created: ${outputFile}`);
        resolve();
      } else {
        console.error(`✗ Failed to create clip: ${outputFile} (code: ${code})`);
        reject(new Error(`FFmpeg extraction failed with code ${code}`));
      }
    });
  });
}

function startRecording(): ChildProcess {
  console.log("Starting stream recording...");

  const recordArgs = [
    "-y",
    "-hide_banner",
    "-i",
    RTMP_URL,
    "-c:v",
    "h264_nvenc",
    "-preset",
    "slow",
    "-rc:v",
    "vbr",
    "-cq:v",
    "19",
    "-b:v",
    "8000k",
    "-maxrate",
    "12000k",
    "-bufsize",
    "16000k",
    "-c:a",
    "aac",
    "-b:a",
    "384k",
    "-f",
    "mpegts",
    TEMP_FILE,
  ];

  const process = spawn("ffmpeg", recordArgs);

  process.on("close", (code) => {
    console.log(`Recording process exited with code ${code}`);
  });

  process.stderr.on("data", (data) => {
    const output = data.toString();
    if (output.includes("error") || output.includes("Error")) {
      console.error("Recording error:", output);
    }
  });

  return process;
}

function startSilenceDetection(): ChildProcess {
  console.log("Starting silence detection...");

  const detectArgs = [
    "-i",
    RTMP_URL,
    "-af",
    `silencedetect=n=${SILENCE_THRESHOLD}dB:d=${SILENCE_DURATION}`,
    "-f",
    "null",
    "-",
  ];

  const process = spawn("ffmpeg", detectArgs);

  process.stderr.on("data", (data) => {
    const output = data.toString();
    const lines = output.split("\n");

    for (const line of lines) {
      if (line.includes("silence_end")) {
        const speechStart = parseTimestamp(line, "silence_end");
        if (speechStart !== null) {
          currentSpeechStart = speechStart;
          console.log(`🎤 Speech started at: ${speechStart.toFixed(1)}s`);
        }
      } else if (line.includes("silence_start")) {
        const speechEnd = parseTimestamp(line, "silence_start");
        if (speechEnd !== null && currentSpeechStart !== null) {
          console.log(`🔇 Speech ended at: ${speechEnd.toFixed(1)}s`);

          // Store the segment for processing
          const segment: SpeechSegment = {
            start: currentSpeechStart,
            end: speechEnd,
            duration: speechEnd - currentSpeechStart,
          };

          speechSegments.push(segment);

          // Process the segment after a delay
          setTimeout(() => {
            extractSpeechClip(segment.start, segment.end).catch((error) =>
              console.error("Failed to extract clip:", error)
            );
          }, 3000); // 3 second delay to ensure data is written

          currentSpeechStart = null;
        }
      }
    }
  });

  process.on("close", (code) => {
    console.log(`Silence detection process exited with code ${code}`);
  });

  return process;
}

async function processQueuedSegments(): Promise<void> {
  // Process any remaining segments when shutting down
  console.log(`Processing ${speechSegments.length} queued segments...`);

  for (const segment of speechSegments) {
    try {
      await extractSpeechClip(segment.start, segment.end);
    } catch (error) {
      console.error(
        `Failed to process segment ${segment.start}-${segment.end}:`,
        error
      );
    }
  }
}

function cleanup(): void {
  console.log("\nCleaning up...");

  if (recordProcess) {
    recordProcess.kill("SIGTERM");
    recordProcess = null;
  }

  if (detectProcess) {
    detectProcess.kill("SIGTERM");
    detectProcess = null;
  }
}

async function startSpeechSegmentation(): Promise<void> {
  await ensureClipsDirectory();

  console.log(`Starting speech segmentation from ${RTMP_URL}`);
  console.log(
    `Silence threshold: ${SILENCE_THRESHOLD}, Duration: ${SILENCE_DURATION}s`
  );
  console.log(`Minimum clip duration: ${MIN_CLIP_DURATION}s`);
  console.log(`Output directory: ${CLIPS_DIR}/`);
  console.log(`Recording to: ${TEMP_FILE}`);
  console.log("---");

  // Start recording first
  recordProcess = startRecording();

  // Wait for recording to establish
  console.log("Waiting for recording to start...");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Start silence detection
  detectProcess = startSilenceDetection();

  // Handle graceful shutdown
  const shutdownHandler = async () => {
    console.log("\nShutting down...");
    cleanup();

    // Process any remaining segments
    await processQueuedSegments();

    process.exit(0);
  };

  process.on("SIGINT", shutdownHandler);
  process.on("SIGTERM", shutdownHandler);
}

// Start the segmentation if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startSpeechSegmentation().catch((error) => {
    console.error("Error starting speech segmentation:", error);
    cleanup();
    process.exit(1);
  });
}

export { startSpeechSegmentation, extractSpeechClip, cleanup };
