If you don't know generics, I promise you'll understand them by the end of this thread.

I like a challenge.

```typescript
const objKeys = <T extends object>(obj: T) => {
  return Object.keys(obj) as Array<keyof T>;
};
```

---

What you might think of as generics in TypeScript is actually three separate concepts:

- Passing types to types
- Passing types to functions
- Inferring types from arguments passed to functions

```typescript
// 1. Passing types to types
type PartialUser = Partial<{
  id: string;
  name: string;
}>;

// 2. Passing types to functions
const stringSet = new Set<string>();

// 3. Inferring types from arguments passed to functions
const objKeys = <T extends object>(obj: T) => {
  return Object.keys(obj) as Array<keyof T>;
};

const keys = objKeys({ a: 1, b: 2 });
//    ^?
```

---

Let's start with passing types to types.

In TypeScript, you can declare a type which represents an object, primitive, function - whatever you want, really.

```typescript
type User = {
  id: string;
  name: string;
};

type ToString = (input: any) => string;
```

---

But let's say you need to create a few types with a similar structure. For instance, a data shape.

The code below isn't very DRY - can we clean it up?

```typescript
type ErrorShape = {
  message: string;
  code: number;
};

type GetUserData = {
  data: {
    id: string;
    name: string;
  };
  error?: ErrorShape;
};

type GetPostsData = {
  data: {
    id: string;
    title: string;
  }[];
  error?: ErrorShape;
};

type GetCommentsData = {
  data: {
    id: string;
    content: string;
  }[];
  error?: ErrorShape;
};
```

---

If you're OOP-inclined, you could do this using a reusable interface...

```typescript
interface DataBaseInterface {
  error?: ErrorShape;
}

interface GetUserData extends DataBaseInterface {
  data: {
    id: string;
    name: string;
  };
}

interface GetPostsData extends DataBaseInterface {
  data: {
    id: string;
    title: string;
  }[];
}

interface GetCommentsData
  extends DataBaseInterface {
  data: {
    id: string;
    content: string;
  }[];
}
```

---

But it's more concise to create a 'type function', which takes in the type of data and returns the new data shape.

```typescript
// Our new type function!
type DataShape<TData> = {
  data: TData;
  error?: ErrorShape;
};

type GetUserData = DataShape<{
  id: string;
  name: string;
}>;

type GetPostsData = DataShape<
  {
    id: string;
    title: string;
  }[]
>;

type GetCommentsData = DataShape<
  {
    id: string;
    content: string;
  }[]
>;
```

---

This syntax is important to understand, because it'll come up later.

The angle brackets - <TData> - tell TypeScript that we want to add a _type argument_ to this type.

We can name TData anything, it's just like an argument to a function.

This is a generic type.

```typescript
// Generic type
type DataShape<TData> = {
  data: TData;
  error?: ErrorShape;
};

// Passing our generic type
// another type
type GetPostsData = DataShape<
  {
    id: string;
    title: string;
  }[]
>;
```

---

Generic types can accept multiple type arguments.

You can provide defaults to type arguments.

You can even provide constraints on type arguments so only certain types can be passed.

But, y'know, I've got to keep this thread moving.

---

What if I told you that it wasn't just _types_ that you could pass types to?

```typescript
const createSet = <T>() => {
  return new Set<T>();
};

const stringSet = createSet<string>();
//    ^?

const numberSet = createSet<number>();
//    ^?
```

---

That's right - just like types can accept types as arguments, so can functions.

In this example, we add a <T> before the parentheses when we declare createSet.

We then pass that <T> manually into Set(), which itself lets you pass a type argument.

```typescript
const createSet = <T>() => {
  return new Set<T>();
};
```

---

That means that when we call it, we can pass a type argument of <string> to createSet.

And we end up with a Set that we can only pass strings to.

```typescript
const stringSet = createSet<string>();

// Error!
stringSet.add(123);
```

---

This is the second thing that people mean when they talk about generics - manually passing types to functions.

You'll have seen this if you use React, and you've needed to pass a type argument to useState.

```typescript
const [index, setIndex] = useState<number>(0);
//     ^?
```

---

But, you'll also have noticed another behavior in React.

Which is that in some cases, you don't need to pass the type argument for it to be inferred...

```typescript
const [index, setIndex] = useState(0);
//     ^?

// WHAT IS THIS SORCERY
```

---

Let's look at our createSet function again.

You'll notice that it takes in no _actual_ arguments - only type arguments.

```typescript
const createSet = <T>() => {
  return new Set<T>();
};
```

---

This means that when we call it without any type arguments (which we can do without TS yelling at us), our set will be a Set<unknown>.

```typescript
const set = createSet();
//    ^?
```

---

But what if we change our function so that it accepts an initial value for the set?

We know that the initial value needs to be the same type as the Set, so let's type it as T.

```typescript
const createSet = <T>(initial: T) => {
  return new Set<T>([initial]);
};
```

---

Now, when we call it, we'll need to pass in an initial, and that'll need to be the same type as the type argument we pass to createSet.

```typescript
const stringSet = createSet<string>("matt");
//    ^?

const numberSet = createSet<number>("pocock");
//    ^?
```

---

But here's the magical thing. TypeScript can infer the type of 'T' from 'initial'.

In other words, the type argument will be inferred from the runtime argument.

```typescript
const stringSet = createSet("matt");
//    ^?

const numberSet = createSet(123);
//    ^?
```

---

You can examine this by hovering over one of the createSet calls.

You'll see that <string> is being inferred when we pass it a string.

```typescript
const stringSet = createSet("matt");
//    ^?

const numberSet = createSet(123);
//    ^?
```

The same is true in useState:

```typescript
const [index, setIndex] = useState(0);
//     ^?
```

---

And in the objKeys function I showed at the very top of this thread.

This one has some extra goodness, too:

- We constrain T to be an object so it can be passed to Object.keys (which only accepts objects)
- We force the return type of Object.keys to be Array<keyof T>

```typescript
const objKeys = <T extends object>(obj: T) => {
  return Object.keys(obj) as Array<keyof T>;
};
```

---

What you think of as 'generics' are actually several different patterns:

- Passing types to types - DataShape<T>
- Passing types to functions - createSet<string>()
- Inferring types from arguments passed to functions - useState(0)

---

If this felt like it went over your head, then you should check out my free TypeScript beginners course.

It's interactive, in-depth, and gives you everything you need to become a TS developer.

https://www.totaltypescript.com/tutorials

---

But if you got something out of this thread, then share it! I'm a full-time educator, so sharing my stuff really means a lot.

Have a lovely day.
