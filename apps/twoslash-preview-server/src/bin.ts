import {
  type AbsolutePath,
  getActiveEditorFilePath,
} from "@total-typescript/shared";
import {
  type WSEvent,
  SHIKI_TEST_LOCATION,
} from "@total-typescript/twoslash-shared";
import chokidar from "chokidar";
import path from "path";
import { type WebSocket, WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 3001 });

const clientWrapper = () => {
  let idCounter = 0;

  let currentFilePath: AbsolutePath | undefined;

  const clients: Record<number, WebSocket> = {};

  const addClient = (client: WebSocket) => {
    idCounter++;
    clients[idCounter] = client;

    if (currentFilePath) {
      send({
        type: "change",
        uri: currentFilePath,
      });
    }

    return idCounter;
  };

  const removeClient = (id: number) => {
    delete clients[id];
  };

  const send = (event: WSEvent) => {
    Object.values(clients).forEach((client) => {
      client.send(JSON.stringify(event));
    });
  };

  const updateFilePath = (filePath: AbsolutePath) => {
    currentFilePath = filePath;
    send({
      type: "change",
      uri: filePath,
    });
  };

  return {
    addClient,
    removeClient,
    updateFilePath,
  };
};

const { addClient, removeClient, updateFilePath } = clientWrapper();

server.on("connection", (client) => {
  const id = addClient(client);

  client.on("disconnect", () => {
    removeClient(id);
  });
});

const CONTENT_PATH = path.resolve(process.cwd(), `../written-content/**/*.md`);
const ROOT = path.resolve(process.cwd(), "../written-content");

const reportFilePath = (filePath: AbsolutePath) => {
  console.log("File changed: " + path.relative(ROOT, filePath));

  updateFilePath(filePath);
};

const main = async () => {
  const filePath = await getActiveEditorFilePath();

  if (filePath?.startsWith(ROOT) && filePath.endsWith(".md")) {
    reportFilePath(SHIKI_TEST_LOCATION as AbsolutePath);
  } else {
    reportFilePath(SHIKI_TEST_LOCATION as AbsolutePath);
  }

  chokidar
    .watch([CONTENT_PATH, SHIKI_TEST_LOCATION], {
      ignored: ["**/node_modules/**", "**/.next/**"],
    })
    .on("change", reportFilePath);
};

main().catch(console.error);
