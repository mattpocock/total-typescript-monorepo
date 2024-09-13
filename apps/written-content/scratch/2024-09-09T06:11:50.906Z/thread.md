```ts twoslash
const cache: Record<number, Set<string>> = {};

// OPTION 1
const addToCache1 = (index: number, newItem: string) => {
  if (!cache[index]) {
    cache[index] = new Set();
  }
  cache[index].add(newItem);
};

// OPTION 2
const addToCache2 = (index: number, newItem: string) => {
  (cache[index] ??= new Set()).add(newItem);
};
```
