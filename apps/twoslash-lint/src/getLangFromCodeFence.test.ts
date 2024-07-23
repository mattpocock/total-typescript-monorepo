import { expect, it } from "vitest";
import { getLangFromCodeFence } from "./getLangFromCodeFence.js";

it("Should get the language from a code fence", () => {
  const lang = getLangFromCodeFence("```ts twoslash");
  expect(lang).toEqual("ts");
});

it("Should get the language from a code fence", () => {
  const lang = getLangFromCodeFence("```tsx twoslash");
  expect(lang).toEqual("tsx");
});

it("Should get the language from a code fence", () => {
  const lang = getLangFromCodeFence("```json twoslash");
  expect(lang).toEqual("json");
});

it("Should get the language from a code fence", () => {
  const lang = getLangFromCodeFence("```ts");
  expect(lang).toEqual("ts");
});
