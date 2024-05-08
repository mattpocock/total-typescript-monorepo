Another interesting use of {} is to lower inference priority for type parameters.

```ts
declare function f<const T>(arg1: T, arg2: T): void;

f(1, 2); // OK, T inferred as 1 | 2

declare function f<const T>(arg1: T & {}, arg2: T): void;

f(1, 2); // ERROR, T inferred as 2

declare function f<const T>(arg1: T, arg2: T & {}): void;

f(1, 2); // ERROR, T inferred as 1

declare function f<const T>(
  arg1: T & {},
  arg2: T & {}
): void;

f(1, 2); // OK, T inferred as 1 | 2
```
