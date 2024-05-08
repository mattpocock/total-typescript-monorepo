The `satisfies` operator gives you a way to add type annotations to values without losing the inference of the value.

If you want to learn more, I've got a deep dive in [this article](https://www.totaltypescript.com/clarifying-the-satisfies-operator).

But here, let's dive deep into some use cases.

## Strongly type URL Search Params with satisfies

`satisfies` is great for strongly typing functions which usually take a much looser type.

When you're working with `URLSearchParams`, it usually takes a `Record<string, string>` as its argument. This a very loose type - and doesn't enforce any particular keys.

But usually, you're creating some search params to pass them to a URL. So the loose type ends up being quite dangerous.

`satisfies` to the rescue. You can use it inline to strongly type the params object.

```ts twoslash
const GITHUB_REPO = `/microsoft/TypeScript/issues/new`;

// ---cut---
// @errors: 1360
type GHIssueURLParams = {
  title: string;
  body: string;
};

const params = new URLSearchParams({
  title: "New Issue",
} satisfies GHIssueURLParams);

const url = `${GITHUB_REPO}?${params}`;
```

Here, we're getting an error saying we've got a missing property `body`. This is great, because it means we can't accidentally create a URL without a body.

## Strongly typed POST request with satisfies

When making POST requests, it's important to send the correct data structure to the server. The server will expect a specific format for the request body, but the process of turning it into JSON with `JSON.stringify` removes any strong typings.

But with the `satisfies` operator, we can strongly type it.

```ts twoslash
type Post = {
  title: string;
  content: string;
};

fetch("/api/posts", {
  method: "POST",
  body: JSON.stringify({
    title: "New Post",
    content: "Lorem ipsum.",
  } satisfies Post),
});
```

Here, we can annotate the request body with the `Post` type, ensuring that the title and content properties are present and of the correct type.

## Infer tuples without `as const` with satisfies

Often, you'll want to declare an array of elements in TypeScript - but have it inferred as a tuple, not an array.

Normally, you would use the `as const` assertion to infer a tuple type instead of an array type. However, with the `satisfies` operator, you can achieve the same result without using `as const`.

```ts
// @errors: 2493
// @noUncheckedIndexedAccess: true

type MoreThanOneMember = [any, ...any[]];

const array = [1, 2, 3];
//    ^?

const maybeExists = array[3];
//    ^?

const tuple = [1, 2, 3] satisfies MoreThanOneMember;
//    ^?

const doesNotExist = tuple[3];
```

In the code above, we're declaring an array two different ways. If we don't annotate it with `satisfies`, it gets inferred as `number[]`. This means when we try to access an element on it that doesn't exist, TypeScript doesn't give us an error - it just infers it as `number | undefined`.

However, when we declare `tuple` using the `satisfies` operator, it infers the type as a tuple with exactly three elements. Now, when we try to access the fourth element with `tuple[3]`, TypeScript correctly gives us an error because the index is out of bounds.

---

Write the next section of this article, with the following title and code sample.

## Enforce an `as const` array to be a certain shape with satisfies

```ts twoslash
type NavElement = {
  title: string;
  url?: string;
  children?: readonly NavElement[];
};

const nav = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "About",
    children: [
      {
        title: "Team",
        url: "/about/team",
      },
    ],
  },
] as const satisfies readonly NavElement[];

// @errors: 2339
nav[0].children;
```
