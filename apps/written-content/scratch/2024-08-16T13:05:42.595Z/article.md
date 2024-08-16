We're all talking about 'errors as values' again. But I find the Result<T> pattern a bit verbose.

Here's a method for doing it with as few type annotations as possible 🧵

```ts twoslash
interface Failure<T> {
  success: false;
  error: T;
}

const Failure = <T>(error: T): Failure<T> => ({
  success: false,
  error,
});

interface Success<T> {
  success: true;
  value: T;
}

const Success = <T>(value: T): Success<T> => ({
  success: true,
  value,
});

// ---cut---
const demoFunction = () => {
  const result = Math.random();
  if (result > 0.5) {
    return Failure(
      "Math.random produced too high a number",
    );
  }

  return Success(result);
};

const result = demoFunction();
//    ^?
```

---

Let's describe what our code is doing here. Our function has two possible 'states' - success or failure.

If it succeeds, it returns a number. If it fails it returns an error.

We could model this by simply returning the two branches, which I've shown before:

```ts twoslash
const demoFunction = () => {
  const result = Math.random();
  if (result > 0.5) {
    return new Error(
      "Math.random produced too high a number",
    );
  }

  return result;
};

const result = demoFunction();
//    ^?
```

---

This is nice, because you can see that the function can either return a number or an error.

You can use instanceof to check it:

```ts twoslash
const demoFunction = () => {
  const result = Math.random();
  if (result > 0.5) {
    return new Error(
      "Math.random produced too high a number",
    );
  }

  return result;
};

// ---cut---
const result = demoFunction();

if (result instanceof Error) {
  console.error(result.message);
  //            ^?
} else {
  console.log(result);
  //          ^?
}
```

---

Another way you could express this would be to use a `Result` type.

This is a common pattern in other languages. You box up both the 'success' and the 'failure' into a single object.

Then result might be either success or failure.

```ts twoslash
type Success<T> = {
  success: true;
  value: T;
};

type Failure<E> = {
  success: false;
  error: E;
};

type Result<T, E> = Success<T> | Failure<E>;
```

---

You can then use it like this:

```ts twoslash
type Success<T> = {
  success: true;
  value: T;
};

type Failure<E> = {
  success: false;
  error: E;
};

type Result<T, E> = Success<T> | Failure<E>;

// ---cut---
const demoFunction = (): Result<number, string> => {
  const result = Math.random();
  if (result > 0.5) {
    return {
      success: false,
      error: "Math.random produced too high a number",
    };
  }

  return { success: true, value: result };
};

const result = demoFunction();
//    ^?
```

---

We can then check `if (result.success)` to see if it's a success or a failure.

```ts twoslash
type Success<T> = {
  success: true;
  value: T;
};

type Failure<E> = {
  success: false;
  error: E;
};

type Result<T, E> = Success<T> | Failure<E>;

const demoFunction = (): Result<number, string> => {
  const result = Math.random();
  if (result > 0.5) {
    return {
      success: false,
      error: "Math.random produced too high a number",
    };
  }

  return { success: true, value: result };
};

// ---cut---
const result = demoFunction();

if (result.success) {
  console.log(result.value);
  //          ^?
} else {
  console.error(result.error);
  //            ^?
}
```

---

This is quite nice, but it forces you to provide a return type to the function.

If you don't, the inference won't quite work. We end up with success being `boolean` in both branches instead of `true` for success and `false` for failure.

```ts twoslash
const demoFunction = () => {
  const result = Math.random();
  if (result > 0.5) {
    return {
      success: false,
      error: "Math.random produced too high a number",
    };
  }

  return { success: true, value: result };
};

const result = demoFunction();
//    ^?
```

---

My preferred way of doing this is to create helper functions for the success and failure branches.

Let's create `Success` and `Failure` interfaces:

```ts twoslash
interface Failure<T> {
  success: false;
  error: T;
}

interface Success<T> {
  success: true;
  value: T;
}
```

---

And then create functions to match.

Notice how we're able to use the same name for the function and the interface. I quite like the look of this, but your mileage may vary.

```ts twoslash
interface Failure<T> {
  success: false;
  error: T;
}

interface Success<T> {
  success: true;
  value: T;
}

const Failure = <T>(error: T): Failure<T> => ({
  success: false,
  error,
});

const Success = <T>(value: T): Success<T> => ({
  success: true,
  value,
});
```

---

Now, we can use them in our function.

This means our hover ends up being beautifully concise - `Failure<string> | Success<number>`.

```ts twoslash
interface Failure<T> {
  success: false;
  error: T;
}

const Failure = <T>(error: T): Failure<T> => ({
  success: false,
  error,
});

interface Success<T> {
  success: true;
  value: T;
}

const Success = <T>(value: T): Success<T> => ({
  success: true,
  value,
});

// ---cut---
const demoFunction = () => {
  const result = Math.random();
  if (result > 0.5) {
    return Failure(
      "Math.random produced too high a number",
    );
  }

  return Success(result);
};

const result = demoFunction();
//    ^?
```

---

And we can use the same narrowing as we did before.

All of this with the minimal number of annotations. Beautiful.

```ts twoslash
interface Failure<T> {
  success: false;
  error: T;
}

const Failure = <T>(error: T): Failure<T> => ({
  success: false,
  error,
});

interface Success<T> {
  success: true;
  value: T;
}

const Success = <T>(value: T): Success<T> => ({
  success: true,
  value,
});

const demoFunction = () => {
  const result = Math.random();
  if (result > 0.5) {
    return Failure(
      "Math.random produced too high a number",
    );
  }

  return Success(result);
};

// ---cut---
const result = demoFunction();

if (result.success) {
  console.log(result.value);
  //          ^?
} else {
  console.error(result.error);
  //            ^?
}
```
