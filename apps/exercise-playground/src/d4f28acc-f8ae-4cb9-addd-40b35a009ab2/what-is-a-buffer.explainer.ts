// http://localhost:3004/courses/exercises/d4f28acc-f8ae-4cb9-addd-40b35a009ab2/edit

const buffer = Buffer.from([0, 255]);

console.log(buffer[0]); // 0
console.log(buffer[1]); // 255

console.log(buffer instanceof Uint8Array); // true!

// All the usual array methods!
buffer.find;
buffer.findIndex;
buffer.includes;
buffer.filter;

// Except for the ones that mutate the array:
// buffers can't be mutated
buffer.push;

// You can iterate over a buffer!
for (const byte of buffer) {
  console.log(byte);
}
