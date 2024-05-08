```ts twoslash
declare global {
  interface ObjectConstructor {
    groupBy<T, K extends PropertyKey>(
      arr: T[],
      grouper: (item: T, index: number) => K
    ): { [K2 in K]: T[] };
  }

  interface MapConstructor {
    groupBy<T, K>(
      arr: T[],
      grouper: (item: T, index: number) => K
    ): Map<K, T[]>;
  }
}

export {};

// ---cut---

const array = [1, 2, 3, 4, 5];

const result = Object.groupBy(array, (num, index) => {
  return num % 2 === 0 ? "even" : "odd";
});

console.log(result);
//          ^?

const odd = { odd: true };
const even = { even: true };
const mapResult = Map.groupBy(array, (num, index) => {
  return num % 2 === 0 ? even : odd;
});

console.log(mapResult);
//          ^?
```

Why not static array methods? They were attempted twice but resulted in incompatibilities.
