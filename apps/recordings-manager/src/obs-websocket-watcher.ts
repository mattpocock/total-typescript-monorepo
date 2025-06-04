// Requires: npm install obs-websocket-js
import OBSWebSocket from "obs-websocket-js";

const obs = new OBSWebSocket();

async function main() {
  await obs.connect("ws://192.168.1.55:4455"); // Default OBS WebSocket v5 URL
  console.log("Connected to OBS WebSocket");

  obs.on("RecordStateChanged", (data) => {
    resolve(data.outputState);
  });
}
