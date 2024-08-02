import { runImageServer } from "./run-image-server.js";
import { runWebsocketServer } from "./run-websocket-server.js";

runWebsocketServer().catch((e) => {
  console.error(e);
  process.exit(1);
});

runImageServer().catch((e) => {
  console.error(e);
  process.exit(1);
});
