Here's a challenge for you. Our `retry` function below doesn't infer the type of the resolved promise. Can you fix it?

<Editor>

```typescript
async function retry(
  fn: () => Promise<any>,
  retries: number = 5
): Promise<any> {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      console.log("Retrying...");
      return await retry(fn, retries - 1);
    }
    throw err;
  }
}

const getString = () => Promise.resolve("hello");
const getNumber = () => Promise.resolve(42);

retry(getString).then((str) => {
  // str should be string, not any!
  console.log(str);
});

retry(getNumber).then((num) => {
  // num should be number, not any!
  console.log(num);
});
```

</Editor>

## Why Is The Error Happening?

The error above is happening because we're using `any` as the return type of the promise in the `retry` function:

```ts
async function retry(
  fn: () => Promise<any>,
  retries: number = 5
): Promise<any> {
  // ...
}
```

This means that when we call the `retry` function, TypeScript can't infer the type of the resolved promise. It's just `any`.

This is bad, because `any` disables type checking on anything it's applied to. This means that just by using our `retry` function, we're losing type safety on whatever we pass into it.

This is a common problem when you're working with reusable functions in TypeScript - it's tempting to slap an `any` on there and move on. But with just a bit of extra work, we can make our functions much more flexible and type-safe.

## Solution: Use A Type Parameter

Instead of using `any`, we can use a type parameter to make the `retry` function more flexible:

```ts twoslash
async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 5
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      console.log("Retrying...");
      return await retry(fn, retries - 1);
    }
    throw err;
  }
}
```

We've added a type parameter `T` to the `retry` function. We're then referencing it in the `fn` parameter as the thing we expect to get back from our promise. Finally, we use it as the return type of the `retry` function.

This means that when we call the `retry` function, TypeScript can infer the type of the resolved promise. It's no longer `any` - it's the type we return from our promise.

```ts twoslash
async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 5
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      console.log("Retrying...");
      return await retry(fn, retries - 1);
    }
    throw err;
  }
}

// ---cut---

const getString = () => Promise.resolve("hello");

retry(getString).then((str) => {
  // str is string, not any!
  console.log(str);
});
```

We can name `T` anything we like: `TData` or `TResponse` are common choices. I like using `T` at the start to represent 'type parameter'.

Our `retry` function is now a _generic function_ - it captures type information from the runtime values passed in. This means it's a lot more reusable and safe to use.

## Generics

If you're interested in learning more about generics, my course Total TypeScript has an [entire module](https://www.totaltypescript.com/workshops/typescript-generics) covering them in-depth.

Or, you could check out the other [articles I've written](https://www.totaltypescript.com/articles) on generics on this site.
