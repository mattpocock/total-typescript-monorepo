import {
  type AbsolutePath,
  getActiveEditorFilePath,
} from "@total-typescript/shared";
import chokidar from "chokidar";
import { readFile } from "fs/promises";
import path from "path";
import { type WebSocket, WebSocketServer } from "ws";
import {
  type CodeSnippet,
  type WSEvent,
  applyShiki,
} from "@total-typescript/twoslash-preview-shared";

const DEMO_PATH = path.resolve(
  process.cwd(),
  "../written-content/emails/loose-autocomplete/email.md",
) as AbsolutePath;

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
const root = path.resolve(process.cwd(), "../written-content");

const runShikiOnFilePath = async (filePath: AbsolutePath) => {
  console.clear();
  console.log("File changed: " + path.relative(root, filePath));

  try {
    let contents = await readFile(filePath, "utf-8");

    if (!filePath.endsWith("md")) {
      const ext = path.extname(filePath);

      contents =
        "```" + ext.slice(1) + " twoslash\n" + contents.trim() + "\n```";
    }

    const { html, snippets } = await applyShiki(contents);

    updateHtml(html, snippets);
    console.log("No errors found!");
  } catch (e: any) {
    if (e.title && e.description && e.recommendation) {
      console.log(e.title);
      console.log(e.description);
      console.log(e.recommendation);
    } else {
      console.error(e);
    }
  }
};

const main = async () => {
  const filePath = await getActiveEditorFilePath();

  if (!filePath) {
    await runShikiOnFilePath(DEMO_PATH);
  } else if (filePath.startsWith(root)) {
    await runShikiOnFilePath(filePath);
  }

  chokidar
    .watch([contentPath], {
      ignored: ["**/node_modules/**", "**/.next/**"],
    })
    .on("change", runShikiOnFilePath);
};

main().catch(console.error);
