I've been thinking more about the empty object type - and I think I finally get it.

But on the surface, it can look pretty strange.

🧵

```ts twoslash
// @errors: 2322
const example1: {} = "str";
const example2: {} = 123;
const example3: {} = true;

const example4: {} = null;
const example5: {} = undefined;
```

---

The empty object type is WEIRD. It doesn't represent "any object". Instead, it represents any value that isn't `null` or `undefined`.

Here's my full breakdown on Total TypeScript:

https://www.totaltypescript.com/the-empty-object-type-in-typescript

---

You might think you can only pass objects to it. In fact, a lot of folks use this to represent an 'empty object':

```ts twoslash
interface Empty {}

const receivesEmpty = (empty: Empty) => {};
```

---

The danger is that our 'receivesEmpty' function can actually take in a BUNCH of different things - like strings, numbers, booleans, and objects.

```ts twoslash
interface Empty {}

const receivesEmpty = (empty: Empty) => {};

// ---cut---

// No errors!

receivesEmpty("str");
receivesEmpty(123);
receivesEmpty(true);
receivesEmpty({ foo: "whatever" });
```

---

The only things we can't pass to it are `null` or `undefined`:

```ts twoslash
// @errors: 2345
interface Empty {}

const receivesEmpty = (empty: Empty) => {};

// ---cut---

receivesEmpty(null);

receivesEmpty(undefined);
```

---

Side note - if we truly wanted to represent an empty object, we could use Record<PropertyKey, never>:

```ts twoslash
// @errors: 2345 2322
const receivesEmpty = (
  empty: Record<PropertyKey, never>
) => {};

receivesEmpty("str");

receivesEmpty({ foo: true });

receivesEmpty({});
```

---

So why does this '{}' type represent all of these different things?

Let's talk a little bit about 'top types'.

---

If you were to try to represent every possible type in JavaScript, how would you do it?

No anys allowed, no unknowns allowed.

```ts
// How would you type this?
type MyImaginaryType = ???;

const example1: MyImaginaryType = "str";
const example2: MyImaginaryType = 123;
const example3: MyImaginaryType = true;
const example4: MyImaginaryType = { foo: "whatever" };
const example5: MyImaginaryType = null;
const example6: MyImaginaryType = undefined;
```

---

You could do a MASSIVE union to try to get it to work - but the difficulty comes when you try to represent objects.

```ts twoslash
// @errors: 2322
type MyImaginaryType =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;

// How do you represent objects?
const example1: MyImaginaryType = { foo: "123" };
```

---

Here's the solution - and it might surprise you:

type MyImaginaryType = {} | null | undefined;

(And by the way, this is how 'unknown' works under the hood!)

```ts twoslash
type MyImaginaryType = {} | null | undefined;

const example1: MyImaginaryType = "str";
const example2: MyImaginaryType = 123;
const example3: MyImaginaryType = true;
const example4: MyImaginaryType = { foo: "whatever" };
const example5: MyImaginaryType = null;
const example6: MyImaginaryType = undefined;
```

---

This is useful as a convenience, for sure - but why would TypeScript choose an empty object for this behaviour?

---

I like to think of it like this:

If you try to access a property on null or undefined in JavaScript, it'll error. That'll also show in TS.

```ts twoslash
// @errors: 18047
declare const maybeString: null | string;

// ---cut---

maybeString.length;
```

---

But if you try to access a property on an empty object, it won't error.

It'll give you a convenience error in TypeScript, but the JavaScript program will continue.

```ts twoslash
// @errors: 2339
declare const emptyObject: {};

// ---cut---

// Errors, but won't fail at runtime!

emptyObject.length;
```

---

So '{}' represents any object that you can _attempt_ to access properties on. It might have no properties, or it might have many.

It's close to being a 'top type', except for null and undefined.

---

This means you can use it as a stand-in for unknown, if you KNOW that the thing you're receiving isn't null or undefined.

```ts twoslash
type UnknownIsh = {};

const logData = (data: UnknownIsh) => {
  if ("foo" in data && typeof data.foo === "string") {
    console.log(data.foo);
    //               ^?
  }
};
```
