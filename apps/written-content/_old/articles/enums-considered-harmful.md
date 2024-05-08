# Should you use enums?

Enums are an interesting feature of TypeScript. They provide a keyword, `enum`, which lets you define a set of unique values.

```typescript
enum LogLevel {
  DEBUG,
  INFO,
  WARNING,
  ERROR,
}
```

Unlike other TypeScript additions, like `type` and `interface`, enums can be accessed at runtime.

```typescript
console.log(LogLevel.DEBUG);
```

But they can also be used in type annotations.

```typescript
const log = (
  message: string,
  level: LogLevel
) => {};

log("Hello", LogLevel.DEBUG);
```

TypeScript enums are, these days, quite controversial. The abiding opinion on Twitter - at least in my bubble - is that enums are straight-up bad.

<!-- Twitter embeds -->

Let's examine why folks think that way, and try to figure out _when_ we should use enums.

Spoiler alert: it's 'never'.

## Unpredictable at runtime

Let's dive into the behaviour of `enum`. In our example above, each member of `LogLevel` will be resolved to an integer representing the value.

```typescript
enum LogLevel {
  DEBUG,
  INFO,
  WARNING,
  ERROR,
}

console.log(LogLevel.DEBUG); // 0
console.log(LogLevel.INFO); // 1
console.log(LogLevel.WARNING); // 2
console.log(LogLevel.ERROR); // 3
```

You might think that this enum behaves like a regular object at runtime, like:

```typescript
const logLevel = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
};
```

Unfortunately, it exhibits some odd behaviours when `Object.values` is applied to it:

```typescript
enum LogLevel {
  DEBUG,
  INFO,
  WARNING,
  ERROR,
}

console.log(Object.values(LogLevel));
// ["DEBUG", "INFO", "WARNING", "ERROR", 0, 1, 2, 3]

console.log(Object.keys(LogLevel));
// ["DEBUG", "INFO", "WARNING", "ERROR", "0", "1", "2", "3"]
```

`Object.values` extracts both the keys _and_ the values from the enum. `Object.keys` does the same thing.

The reason is that TypeScript _doesn't_ compile an enum in the way you expect. It actually turns it into this rather opaque piece of code:

```js
var LogLevel;

(function (LogLevel) {
  LogLevel[(LogLevel["DEBUG"] = 0)] = "DEBUG";
  LogLevel[(LogLevel["INFO"] = 1)] = "INFO";
  LogLevel[(LogLevel["WARNING"] = 2)] = "WARNING";
  LogLevel[(LogLevel["ERROR"] = 3)] = "ERROR";
})(LogLevel || (LogLevel = {}));
```

Once this [IIFE](https://en.wikipedia.org/wiki/Immediately_invoked_function_expression) runs, you actually end up with a data structure that looks like this:

```typescript
const logLevel = {
  DEBUG: 0,
  0: "DEBUG",
  INFO: 1,
  1: "INFO",
  WARNING: 2,
  2: "WARNING",
  ERROR: 3,
  3: "ERROR",
};
```

This behaviour might be news to you. It certainly was news to me. The runtime behaviour of enums just _feels_ different to what the syntax would lead you to believe.

This is the **first strike against enums**. Their opaque structure leads developers into black holes.

## String enums

The behaviour is a bit more predictable when using string enums instead of numeric enums.

```typescript
enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}
```

This compiles into a much less scary structure:

```js
var LogLevel;

(function (LogLevel) {
  LogLevel["DEBUG"] = "DEBUG";
  LogLevel["INFO"] = "INFO";
  LogLevel["WARNING"] = "WARNING";
  LogLevel["ERROR"] = "ERROR";
})(LogLevel || (LogLevel = {}));
```

`LogLevel` ends up with only the keys and values you expect: `DEBUG`, `INFO`, `WARNING` and `ERROR`. This is a little more predictable.

However, let's imagine we have two enums which contain the same values.

```typescript
enum UserAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

enum PostAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}
```

In theory, we should be able to pass a member of `UserAction` to a function which requires `PostAction`.

```typescript
const canPerformAction = (
  action: PostAction
) => {};

canPerformAction(UserAction.CREATE);
// Argument of type 'UserAction.CREATE' is not assignable
// to parameter of type 'PostAction'.
```

At runtime, this code wouldn't fail. The string value of `CREATE` can be passed to `canPerformAction`, because it's the same value as a member of `PostAction`.

But it fails!

That's because enums break a rule in TypeScript. TypeScript is a [structural type system](https://en.wikipedia.org/wiki/Structural_type_system). When it checks whether you can pass an argument to a function, it checks to see if what you want to pass has the same structure as what the function accepts.

But enums aren't compared structurally. They're compared [_nominally_](https://en.wikipedia.org/wiki/Nominal_type_system). TypeScript knows that `UserAction` is different to `PostAction`, so it prevents you from confusing the two.

This behaviour is sometimes desirable. Nominal typing can be very powerful - I cover it as part of [Total TypeScript](/). But - if you're expecting your string enums to act just like normal JavaScript objects, it can be confusing and frustrating.

## What about const enums?

Another variant of enum is `const enum`. This solves some of the issues with enums, but introduces others.

```typescript
const enum LogLevel {
  DEBUG,
  INFO,
  WARNING,
  ERROR,
}

console.log(LogLevel.DEBUG);
```

`const enum` is useful because it doesn't compile to an object at runtime. The values of the enum are _inlined_ at their call sites. The code above compiles to:

```js
console.log(0 /* LogLevel.DEBUG */);
```

This appears to solve some of the issues with enums. You can't access them as an object, because the object doesn't exist at runtime:

```typescript
Object.values(LogLevel);
// 'const' enums can only be used in property or index access
// expressions or the right hand side of an import declaration
// or export assignment or type query.
```

This error is saying that `LogLevel` can't be accessed _as an object_ - only by accessing its members.

However, the TypeScript docs explicitly recommend [_not_ using `const enum`](https://www.typescriptlang.org/docs/handbook/enums.html#const-enum-pitfalls). It's incompatible with the `isolatedModules` config option, an increasingly common default in `tsconfig.json` files for frontend frameworks like [Next.js](https://nextjs.org).

For that reason, I personally don't consider `const enum` a viable option.

## All Hail the `POJO`

An often-used alternative to enums are `POJO`'s - Plain Old JavaScript Objects. These can be declared like so, in TypeScript:

```typescript
const LOG_LEVEL = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
} as const;
```

The use of `as const` makes `LOG_LEVEL` recursively readonly on the type level, meaning its properties cannot be reassigned:

```typescript
LOG_LEVEL.DEBUG = "wow";
// Cannot assign to 'DEBUG' because it is
// a read-only property.
```

It compiles down into exactly what you'd expect in JavaScript:

```js
const LOG_LEVEL = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
};
```

The trickier part comes when you want to turn it into something you can type your functions with.

You can't do this:

```typescript
const log = (
  message: string,
  logLevel: LOG_LEVEL
) => {};
// 'LOG_LEVEL' refers to a value, but is being used as
// a type here. Did you mean 'typeof LOG_LEVEL'?
```

That's because `LOG_LEVEL` is in the _runtime_ space, not the type space. So we need to turn it into a type. Specifically, the type we're looking for is:

```typescript
type LogLevel =
  | "DEBUG"
  | "INFO"
  | "WARNING"
  | "ERROR";
```

We could declare this manually, but it's pretty cumbersome. The best way to do this in TypeScript is by extracting the `LOG_LEVEL`'s values:

```typescript
type LogLevel =
  (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];
// "DEBUG" | "INFO" | "WARNING" | "ERROR"
```

I cover this syntax in one of my [TypeScript Tips](https://twitter.com/mattpocockuk/status/1598708710523772929) on Twitter. It can be abstracted behind a helper to give it more semantic meaning:

```typescript
type ObjectValues<T> = T[keyof T];

type LogLevel = ObjectValues<typeof LOG_LEVEL>;
// "DEBUG" | "INFO" | "WARNING" | "ERROR"
```

`as const` is a solid alternative to enums. The runtime behaviour is predictable and straightforward. It's used a _lot_ in many different open-source applications I've looked at. Using them on the type level requires a little magic, but that magic can be wrapped in a helper.

## String unions

Our `as const` solution does have one issue - what if we don't need our enum to be available at runtime? Let's imagine that we don't ever need to run `Object.values` on our `LOG_LEVEL`. We have code that looks like this:

```typescript
const LOG_LEVEL = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
} as const;

type LogLevel = ObjectValues<typeof LOG_LEVEL>;

const log = (
  message: string,
  logLevel: LogLevel
) => {};

log("Oh dear!", LOG_LEVEL.ERROR);
```

Can we make it more concise? Absolutely - by using a string union.

```typescript
type LogLevel =
  | "DEBUG"
  | "INFO"
  | "WARNING"
  | "ERROR";

const log = (
  message: string,
  logLevel: LogLevel
) => {};

log("Oh dear!", "ERROR");
```

If you don't need your `POJO` available at

## Enums force you to import

String unions are treated differently to enums. They're just literal types (`DEBUG`, `INFO` etc). This means we can either use `LOG_LEVEL.ERROR`, or simply pass the `ERROR` string:

```typescript
const log = (
  message: string,
  logLevel: LogLevel
) => {};

log("Oh dear!", LOG_LEVEL.ERROR);
log("Oh dear!", "ERROR");
```

If we were using enums, we would _have_ to import our enum and use it - it doesn't accept the literal value:

```typescript
enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

const log = (
  message: string,
  logLevel: LogLevel
) => {};

log("Oh no!", "ERROR");
// Argument of type '"ERROR"' is not assignable to
// parameter of type 'LogLevel'.
```

<!-- This constraint can be pretty annoying, but it does lead to some benefits (refactoring) -->

## Do enums improve Refactoring?

## As const gives your data structure more flexibility

## Frags

Not used in types as comments proposal

Enums should be a JS feature (TC39 proposal)

TypeScript is at its best when it provides a thin, transparent layer of typings over your JavaScript. Replacing inline values feels like it breaks the mental model.
