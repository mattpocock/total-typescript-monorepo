import { env } from "@total-typescript/env";
import chokidar from "chokidar";
import fs from "fs";
import path from "path";

const WATCH_DIR = env.OBS_OUTPUT_DIRECTORY;

// Helper: Get the latest mp4 file in the directory
function getLatestMp4File(dir: string): string | null {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mp4"))
    .map((f) => ({
      name: f,
      time: fs.statSync(path.join(dir, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);
  return files.length > 0 ? path.join(dir, files[0]!.name) : null;
}

// Watch for new mp4 files
const watcher = chokidar.watch(`${WATCH_DIR}/*.mp4`, {
  usePolling: true,
  interval: 1000,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 1000,
  },
});

watcher.on("add", (filePath) => {
  console.log(`Detected new recording: ${filePath}`);
  watchFileGrowth(filePath);
});

// Also check for the latest file on startup
const latest = getLatestMp4File(WATCH_DIR);
if (latest) {
  watchFileGrowth(latest);
}

// Watch a file for growth, log when it stops growing
function watchFileGrowth(filePath: string) {
  let lastSize = 0;
  let stableCount = 0;
  const interval = setInterval(() => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        clearInterval(interval);
        return;
      }
      if (stats.size === lastSize) {
        stableCount++;
        if (stableCount >= 5) {
          // 5 seconds of stability
          clearInterval(interval);
          console.log(`Recording finished: ${filePath}`);
        }
      } else {
        lastSize = stats.size;
        stableCount = 0;
      }
    });
  }, 1000);
}
