// http://localhost:3004/courses/exercises/1c8f0f5b-e703-49de-8e01-f36de47bb778/edit

import { Blob } from "node:buffer";
import { expect, it } from "vitest";

// You can create a Blob from a Buffer
const buffer = Buffer.from([0, 255]);

const blob = new Blob([buffer]);

// Or from strings
const blob2 = new Blob(["abc"]);

// Or from Uint8Arrays
const blob3 = new Blob([new Uint8Array([0, 255])]);

// Or from other blobs
const blob4 = new Blob([blob, blob2, blob3]);

// Blobs have a size property
it("Should have a size of 2", () => {
  const littleBuffer = Buffer.from([0, 1]);
  const blob = new Blob([littleBuffer]);

  expect(blob.size).toBe(2);
});

// Blobs have a type property
it("Should have a type of text/plain", () => {
  const blob = new Blob(["abc"], { type: "text/plain" });

  expect(blob.type).toBe("text/plain");
});

// Blobs come from Web APIs, and actually predate
// Buffers and ArrayBuffers like Uint8Array

// Blobs are immutable - there is no way
// to access the bytes directly without
// creating a new instance:
const bytes = await blob.bytes();
const arrayBuffer = await blob.arrayBuffer();
const text = await blob.text();
