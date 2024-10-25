import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

// 1. Create an interface, taking in stdin and stdout
const rl = createInterface({
  input: stdin,
  output: stdout,
});

// 2. Ask the user a question, and await the result!
const answer = await rl.question(
  "How attractive is Matt Pocock? ",
);

// 3. Get access to the answer immediately
console.log(
  `Thank you for your valuable feedback: ${answer}`,
);

// 4. Close the interface
rl.close();
