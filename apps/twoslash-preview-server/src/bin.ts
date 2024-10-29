import type { AbsolutePath } from "@total-typescript/shared";
import { runImageServer } from "./run-image-server.js";
import { runWebsocketServer } from "./run-websocket-server.js";
import { EventEmitter } from "node:events";

let currentPath: AbsolutePath | undefined;

runImageServer(() => {
  return currentPath;
}).catch((e) => {
  console.error(e);
  process.exit(1);
});

runWebsocketServer((path) => {
  currentPath = path;
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
