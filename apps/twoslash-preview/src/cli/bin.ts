import { applyShiki } from "./applyShiki.js";
import { CodeSnippet, WSEvent } from "../types.js";
import chokidar from "chokidar";
import { readFile } from "fs/promises";
import { homedir } from "os";
import path from "path";
import { WebSocket, WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 3001 });

const clientWrapper = () => {
  let idCounter = 0;
  let html: string = "";
  let snippets: CodeSnippet[] = [];

  const clients: Record<number, WebSocket> = {};

  const addClient = (client: WebSocket) => {
    idCounter++;
    clients[idCounter] = client;

    reportValueUpdated();

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

  const reportValueUpdated = () => {
    send({
      type: "new-html",
      html,
      snippets,
    });
  };

  const updateHtml = (newValue: string, newSnippets: CodeSnippet[]) => {
    html = newValue;
    snippets = newSnippets;
    reportValueUpdated();
  };

  return {
    addClient,
    removeClient,
    updateHtml,
  };
};

const { addClient, removeClient, updateHtml } = clientWrapper();

server.on("connection", (client) => {
  const id = addClient(client);

  client.on("event", (data) => {});
  client.on("disconnect", () => {
    removeClient(id);
  });
});

const contentPath = path.resolve(process.cwd(), `../written-content/**/*.md`);

chokidar.watch([contentPath]).on("change", async (filePath) => {
  console.clear();
  console.log(
    "File changed: " +
      path.relative(path.join(process.cwd(), "../written-content"), filePath),
  );
  try {
    let contents = await readFile(filePath, "utf-8");

    if (!filePath.endsWith("md")) {
      const ext = path.extname(filePath);

      contents =
        "```" + ext.slice(1) + " twoslash\n" + contents.trim() + "\n```";
    }

    const { html, snippets } = await applyShiki(contents);

    updateHtml(html, snippets);
  } catch (e: any) {
    console.log(e.code);

    console.log(e.title);
    console.log(e.description);
  }
});
