Iterating over object keys in TypeScript can be a nightmare.

Here's all the solutions I know of.

```ts twoslash
// @errors: 7053
type User = {
  name: string;
  age: number;
};

// ---cut---

function printUser(user: User) {
  Object.keys(user).forEach((key) => {
    // Doesn't work!
    console.log(user[key]);
  });
}
```

---

Here's the issue: using Object.keys doesn't seem to work as you expect.

That's because it doesn't return the type you kind of need it to.

Instead of a type containing all the keys, it widens it to an array of strings.

```ts twoslash
const user = {
  name: "Daniel",
  age: 26,
};

const keys = Object.keys(user);
//    ^?
```

---

And this means you can't use the key to access the value on the object.

```ts twoslash
// @errors: 7053
const user = {
  name: "Daniel",
  age: 26,
};

const keys = Object.keys(user);
// ---cut---

const nameKey = keys[0];
//    ^?

user[nameKey];
```

---

There's a good reason that TypeScript returns an array of strings here. TypeScript object types are open-ended.

There are many situations where TS can't guarantee that the keys returned by Object.keys are actually on the object - so widening them to string is the only reasonable solution.

Check out this issue for more details.

https://github.com/Microsoft/TypeScript/issues/12870

---

You'll also find this fails if you try to do a for...in loop.

This is for the same reason - that key is inferred as string, just like Object.keys.

```ts twoslash
// @errors: 7053
type User = {
  name: string;
  age: number;
};

// ---cut---

function printUser(user: User) {
  for (const key in user) {
    console.log(user[key]);
  }
}
```

---

But for many cases, you'll feel confident that you know EXACTLY what shape that object is.

So, what do you do?

---

The first option is casting the keys to a more specific type using keyof typeof.

Here, we're casting the result of Object.keys to an array containing those keys.

```ts twoslash
const user = {
  name: "Daniel",
  age: 26,
};

const keys = Object.keys(user) as Array<keyof typeof user>;

keys.forEach((key) => {
  //          ^?
  // No more error!
  console.log(user[key]);
});
```

---

We could also do it at the moment we index into the object.

Here, key is still typed as string - but at the moment we index into the user we cast it to keyof typeof user.

```ts twoslash
const user = {
  name: "Daniel",
  age: 26,
};
// ---cut---

const keys = Object.keys(user);

keys.forEach((key) => {
  //          ^?
  console.log(user[key as keyof typeof user]);
});
```

---

Let's look at some smarter, potentially safer solutions. How about a type predicate?

By using a an 'isKey' helper, we can check that the key is actually on the object before indexing into it.

We get TypeScript to infer properly by using the 'is' syntax in the return type of isKey.

```ts twoslash
const user = {
  name: "Daniel",
  age: 26,
};
const keys = Object.keys(user);
// ---cut---

function isKey<T extends object>(
  x: T,
  k: PropertyKey
): k is keyof T {
  return k in x;
}

keys.forEach((key) => {
  if (isKey(user, key)) {
    console.log(user[key]);
    //               ^?
  }
});
```

---

This awesome solution is taken from Stefan Baumgartner's great blog post on the topic.

https://fettblog.eu/typescript-iterating-over-objects/

---

Let's look at a slightly stranger solution. Inside a generic function, using the 'in' operator WILL narrow the type to the key.

I'm actually not sure why this works and the non-generic version doesn't.

```ts twoslash
type User = {
  name: string;
  age: number;
};

// ---cut---

function printEachKey<T extends object>(obj: T) {
  for (const key in obj) {
    console.log(obj[key]);
    //              ^?
  }
}

// Each key gets printed!
printEachKey({
  name: "Daniel",
  age: 26,
});
```

---

My preferred solution? Usually, casting does the job perfectly well. It's simple, and it's easy to understand.

But if you like the look of the type predicate or generic solutions, go for it. The 'isKey' function looks useful enough that I'll be stealing it for my next project.

---

```ts twoslash
const objectKeys = <T extends object>(
  obj: T
): Array<keyof T> => {
  return Object.keys(obj) as Array<keyof T>;
};

const keys = objectKeys({
  name: "Daniel",
  age: 26,
});

console.log(keys);
//          ^?
```

---

```ts twoslash
const objectKeys = <T extends object>(obj: T) => {
  return Object.keys(obj) as Array<keyof T>;
};

const keys = objectKeys({
  name: "Daniel",
  age: 26,
});

console.log(keys);
//          ^?
```
