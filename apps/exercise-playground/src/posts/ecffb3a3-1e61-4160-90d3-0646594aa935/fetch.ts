// http://localhost:3004/posts/ecffb3a3-1e61-4160-90d3-0646594aa935/edit

const response = await fetch("http://localhost:3008");
const body = await response.body;

if (!body) throw new Error("No body");

const reader = body.getReader();

let results: Uint8Array[] = [];

while (true) {
  const { done, value } = await reader.read();

  if (done) break;

  results.push(value);
  console.log("Received", value);
}

console.log(results);
