---
musicFullVolume: true
---

```ts !!
import { it, describe, expect } from "vitest";

describe("add", () => {
  it("Should add two numbers", () => {
    expect(1 + 1).toBe(2);
  });
});
```

```ts !!
// @types: node
import { it, describe } from "node:test";
import assert from "node:assert";

describe("add", () => {
  it("Should add two numbers", () => {
    assert.strictEqual(1 + 1, 2);
  });
});
```
