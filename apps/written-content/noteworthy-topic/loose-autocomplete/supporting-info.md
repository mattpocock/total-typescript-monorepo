I don't _really_ know why this works, but here's my best guess:

Without the & {}, TypeScript collapses 'small' | 'large' | string into just 'string'. It does this IMMEDIATELY. If you hover over the first example of Size, you'll see that it's just 'string'.

But WITH the & {}, it doesn't collapse the union immediately. It does later (when it's used).

If you hover the second Size type, you'll see it's still 'small' | 'large' | (string & {}), not 'string'.

So that means there's a window that the union hasn't been collapsed where autocomplete can be provided.

---

It's equivalent to string but the compiler doesn't aggressively reduce it because intersecting primitives with object types is used to simulate nominal types ("branding") in a different use case. The lack of aggressive reduction means that (string & {}) | "a" persists as-is, and then the compiler sees "a". It's a workaround using a feature meant for other purposes.

jcalz, StackOverflow

https://stackoverflow.com/questions/70144348/why-does-a-union-of-type-literals-and-string-cause-ide-code-completion-wh#comment123994814_70144348

---

Suggested by RyanC?

https://github.com/microsoft/TypeScript/issues/29729#issuecomment-460346421
