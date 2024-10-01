import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.end("Hello, world!");
});

server.listen(3006, () => {
  console.log("Server is listening on port 3006");
});
