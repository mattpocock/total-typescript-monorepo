```ts twoslash
interface UnionBuilder<T = never> {
  add: <NewValue>() => UnionBuilder<T | NewValue>;
  value: T;
}

declare const u: UnionBuilder;

const result = u
  .add<string>()
  .add<number>()
  .add<boolean>().value;

console.log(result);
//          ^?
```

```ts twoslash
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

interface ObjBuilder<T = {}> {
  add: <NewValue>() => ObjBuilder<T & NewValue>;
  value: Prettify<T>;
}

declare const o: ObjBuilder;

const result = o
  .add<{ a: string }>()
  .add<{ b: string }>()
  .add<{ c: string }>().value;

console.log(result);
//          ^?
```
