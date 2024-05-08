```ts twoslash
class Animal {}

// 1. At runtime, to extend a class
class Dog extends Animal {}
```

```ts twoslash
interface Animal {}

// 2. With interfaces, to make an
// interface extend another
interface Dog extends Animal {}
```

```ts
// 3. Inside conditional types, to
// perform pattern matching
type IsDog<T> = T extends Dog ? true : false;
```
