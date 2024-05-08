The `satisfies` operator gives you a way to add type annotations to values without losing the inference of the value.

If you want to learn more, I've got a deep dive in [this article](https://www.totaltypescript.com/clarifying-the-satisfies-operator).

But here, let's dive deep into some use cases.

## Strongly typed URL Search Params with satisfies

`satisfies` is great for strongly typing functions that usually take a much looser type.

When you're working with `URLSearchParams`, it usually takes a `Record<string, string>` as its argument. This is a very loose type and doesn't enforce any particular keys.

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

Here, we're getting an error saying we've got a missing property `body`. This is great because it means we can't accidentally create a URL without a body.

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

Often, you'll want to declare an array of elements in TypeScript, but have it inferred as a tuple, not an array.

Normally, you would use the `as const` assertion to infer a tuple type instead of an array type. However, with the `satisfies` operator, you can achieve the same result without using `as const`.

```ts twoslash
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

In the code above, we're declaring an array two different ways. If we don't annotate it with `satisfies`, it gets inferred as `number[]`. This means when we try to access an element on it that doesn't exist, TypeScript doesn't give us an error; it just infers it as `number | undefined`.

However, when we declare `tuple` using the `satisfies` operator, it infers the type as a tuple with exactly three elements. Now, when we try to access the fourth element with `tuple[3]`, TypeScript correctly gives us an error because the index is out of bounds.

## Enforce an `as const` object to be a certain shape with satisfies

When using `as const`, we can specify that an object should be treated as an immutable value with literal types. However, this doesn't enforce any specific shape or properties for the object. To enforce a certain shape for an `as const` object, we can leverage the `satisfies` operator.

In the example below, we have a `RouteObject` type that represents a collection of routes. Each route has a `url` property of type `string`, and an optional `searchParams` property. We want to ensure that our `routes` object satisfies this `RouteObject` type.

```ts twoslash
// @errors: 2741 1360
type RouteObject = Record<
  string,
  {
    url: string;
    searchParams: Record<string, string>;
  }
>;

const routes = {
  home: {
    url: "/",
    searchParams: {},
  },
  about: {
    url: "/about",
  },
} as const satisfies RouteObject;
```

Not only does this give us great errors in the case of a missing property, but it also gives autocomplete for the `routes` object.

## Enforce an `as const` array to be a certain shape with satisfies

Using `satisfies`, `as const`, and arrays together can be a little tricky.

Let's take an example where we have a navigation menu that consists of elements with a title, an optional URL, and an optional array of nested navigation elements under the `children` property.

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
```

Now, if we try to access a property that is not part of the defined shape, TypeScript will give us an error.

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
// ---cut---
// @errors: 2339
nav[0].children;
```

### `readonly` arrays with satisfies

It's important to note the use of `readonly` on the arrays. Without the one on `children`, TypeScript errors:

```ts twoslash
// @errors: 1360
type NavElement = {
  title: string;
  url?: string;
  children?: NavElement[];
};

const nav = [
  {
    title: "About",
    children: [],
  },
] as const satisfies readonly NavElement[];
```

This is because `NavElement[]` is mutable, so it needs to be marked with `readonly` to match up with `as const`.

The same is true if we miss off the final `readonly`:

```ts twoslash
type NavElement = {
  title: string;
  url?: string;
  children?: readonly NavElement[];
};

const nav = [
  {
    title: "About",
    children: [],
  },
] as const satisfies NavElement[];
// @errors: 1360
```

This is because our outer type, `NavElement[]`, is mutable and so not assignable to the readonly `as const` declaration.
