So many folks don't know about structuredClone.

It's awesome, built-in, and supported in all major browsers.

Let's learn 🧵

```ts twoslash
// @noErrors
// Bad - calls .toString() on everything
const cloned = JSON.parse(JSON.stringify(obj));

// Bad - only one level deep
const cloned = { ...obj };

// Good - clones everything deeply
const cloned = structuredClone(obj);
```

---

A common pattern in
