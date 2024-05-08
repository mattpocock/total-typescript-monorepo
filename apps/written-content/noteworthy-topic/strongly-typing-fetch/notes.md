```ts twoslash
// @errors: 2322

export const get = async (
  url: string,
  input: Record<string, string>
) => {
  return fetch(
    `${url}?${new URLSearchParams(input).toString()}`
  );
};

export const post = async (
  url: string,
  input: Record<string, string>
) => {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(input),
  });
};

// ---cut---

type CreateAPIMethod = <
  TInput extends Record<string, string>,
  TOutput
>(opts: {
  url: string;
  method: "GET" | "POST";
}) => (input: TInput) => Promise<TOutput>;

const createAPIMethod: CreateAPIMethod =
  (opts) => (input) => {
    const method = opts.method === "GET" ? get : post;

    return (
      method(opts.url, input)
        // Imagine error handling here...
        .then((res) => res.json())
    );
  };

/**
 * You can reuse this function as many times as you
 * like to create all your API methods!
 */
const getUser = createAPIMethod<
  { id: string }, // The input
  { name: string } // The output
>({
  method: "GET",
  url: "/user",
});

getUser({ id: 123 }); // All type safe!
```

```ts twoslash
// @errors: 2322
type CreateAPIMethod = <
  TInput extends Record<string, string>, // The input
  TOutput // The output
>(opts: {
  url: string;
  method: "GET" | "POST";
}) => (input: TInput) => Promise<TOutput>;

declare const createAPIMethod: CreateAPIMethod;

/**
 * You can reuse this function as many times as you
 * like to create all your API methods!
 */
const getUser = createAPIMethod<
  { id: string }, // The input
  { name: string } // The output
>({
  method: "GET",
  url: "/user",
});

getUser({ id: 123 }); // All type safe!
```
