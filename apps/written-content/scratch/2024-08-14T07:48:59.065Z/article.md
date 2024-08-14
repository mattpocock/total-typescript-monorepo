TypeScript's enums. I don't like them.

Let's talk about why 🧵

```ts twoslash
// @errors: 2322
// 1. Lets you mix string, number and
// inferred values
enum PackStatus {
  Draft = "Draft",
  Approved = 2,
  Shipped, // 3
}

// 2. Strange behavior with Object.keys
console.log(Object.keys(PackStatus).length); // 5

// 3. JS is structural. Enums are nominal 🤔
enum PackStatus2 {
  Draft = PackStatus.Draft,
}

const example: PackStatus = PackStatus2.Draft;
```

---

Let's start with a bit of context. I like enums. I like them a lot. I would really like JavaScript to have them.

But TypeScript's implementation of them is weird enough for me not to recommend them.

Here's the section on them in my book:

https://www.totaltypescript.com/books/total-typescript-essentials/typescript-only-features#enums

---

Let's start with the fact that you can declare three different types of values for your enums. Numeric, string and inferred:

```ts twoslash
// Numeric
enum PackStatus {
  Draft = 0,
  Approved = 1,
  Shipped = 2,
}

// String
enum PackStatus2 {
  Draft = "Draft",
  Approved = "Approved",
  Shipped = "Shipped",
}

// Inferred
enum PackStatus3 {
  Draft, // Inferred as 0
  Approved, // Inferred as 1
  Shipped, // Inferred as 2
}
```

---

Numeric and string enums actually behave differently in a couple of ways.

First, how many keys do you think the `PackStatus` object has?

```ts twoslash
enum PackStatus {
  Draft = 0,
  Approved = 1,
  Shipped = 2,
}
```

---

The answer is 6. Why? Because TypeScript generates both a value-to-key and a key-to-value mapping for numeric enums.

But for string enums, it doesn't do this, so you end up with the expected 3 keys:

```ts twoslash
enum PackStatus {
  Draft = 0,
  Approved = 1,
  Shipped = 2,
}

// [0, "Draft", 1, "Approved", 2, "Shipped"]
console.log(Object.keys(PackStatus));

enum PackStatus2 {
  Draft = "Draft",
  Approved = "Approved",
  Shipped = "Shipped",
}

// ["Draft", "Approved", "Shipped"]
console.log(Object.keys(PackStatus2));
```

---

They also behave differently when it comes to type-checking.

In places where a string enum is expected, it forces you to pass the enum value:

```ts twoslash
// @errors: 2345
enum PackStatus {
  Draft = "Draft",
  Approved = "Approved",
  Shipped = "Shipped",
}

const logStatus = (status: PackStatus) => {
  console.log(status);
};

logStatus(PackStatus.Draft);

// Errors, correctly!
logStatus("Draft");
```

---

But with numeric enums, you can pass a raw number in places where the enum is expected. What?

```ts twoslash
enum PackStatus {
  Draft = 0,
  Approved = 1,
  Shipped = 2,
}

const logStatus = (status: PackStatus) => {
  console.log(status);
};

logStatus(PackStatus.Draft);

// No error. WHAT?
logStatus(0);
```

---

Hilariously, you can even mix and match numeric and string values in the same enum.

Don't do this.

```ts twoslash
enum PackStatus {
  Draft = "Draft",
  Approved = 2,
  Shipped, // Inferred as 3
}
```

---

My final frustration with enums is fairly subjective.

I like my TypeScript to be just JavaScript with types. Enums feel like they break that rule.

For example, you can't use an enum in place of another enum, even if the values are the same:

```ts twoslash
// @errors: 2345
enum PackStatus {
  Draft = "Draft",
  Approved = "Approved",
  Shipped = "Shipped",
}

enum PackStatus2 {
  Draft = "Draft",
}

const logStatus = (status: PackStatus) => {
  console.log(status);
};

// Errors, even though the values are the same
logStatus(PackStatus2.Draft);
```

---

EVEN if the second enum is just a reference to the first enum.

```ts twoslash
// @errors: 2345
enum PackStatus {
  Draft = "Draft",
  Approved = "Approved",
  Shipped = "Shipped",
}

// ---cut---
enum PackStatus2 {
  Draft = PackStatus.Draft,
}

const logStatus = (status: PackStatus) => {
  console.log(status);
};

// Errors, even though the values are the same
logStatus(PackStatus2.Draft);
```

---

Finally, there are currently 71 issues marked as bugs related to enums in the TypeScript repo.

I've heard hints from the TS team that many of these are uncloseable due to the way enums are implemented.

https://github.com/microsoft/TypeScript/issues?q=is%3Aissue+is%3Aopen+enum+label%3Abug

---

Let me do a quick end-of-thread turnaround.

If I saw an enum in a codebase, I'm unlikely to get rid of it. If it's using inferred values, I'll probably add them explicitly.

But I wouldn't add an enum to a fresh codebase.

---

If you're desperate to use enums, I'd strongly recommend using string enums only.

They're explicit, behave more like enums, and look more like their transpiled code.

---

And if you want to see what I use instead of enums, check out this section of my book:

https://www.totaltypescript.com/books/total-typescript-essentials/deriving-types#using-as-const-for-javascript-style-enums
