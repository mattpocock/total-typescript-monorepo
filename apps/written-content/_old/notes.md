35-problem

Title: Refactoring to a Type Helper

description: Refactor complex type logic into a type helper.

35-solution

title: Creating an "All or Nothing" Type Helper for React props

38-problem

title: Wrapping useState in a Generic Function

39-problem

title: Introduction to Generic Components

39-solution

title: Creating Generic Props for Components

41-problem

title: Passing Type Arguments To Components

41-solution

title: Use the Angle Brackets syntax to pass a type to a component

43-problem

title: Build a useMutation hook

44-problem

title: Generics vs Discriminated Unions

```ts
import { replace } from "string-ts";

const str = "hello-world";
const result = replace(str, "-", " ");
//    ^ 'hello world'
```

```ts twoslash
const set = new Set();

set.add("hello");
set.add(123);
```

```ts twoslash
const set = new Set<string>(["a", "b", "c"]);

set.add("hello");
set.add(123);
```
