```ts !!
interface FetchOptions {
  url: string;
  timeout?: number;
}
```

```ts !!
interface FetchOptions {
  url: string;
  timeout?: number;
}

const myFetch = (opts: FetchOptions) => {
  // implementation
};
```

```ts !!
interface FetchOptions {
  url: string;
  timeout?: number;
}

const myFetch = (opts: FetchOptions) => {
  // implementation
};

const options = {
  url: "/data",
  timeOut: 2000, // Typo here!
};
```

```ts !!
interface FetchOptions {
  url: string;
  timeout?: number;
}

const myFetch = (opts: FetchOptions) => {
  // implementation
};

const options = {
  url: "/data",
  timeOut: 2000,
};

myFetch(options); // No error!
```

```ts !!
// @errors: 2561
interface FetchOptions {
  url: string;
  timeout?: number;
}

const myFetch = (opts: FetchOptions) => {
  // implementation
};

// ---cut---
myFetch({
  url: "/data",
  timeOut: 2000,
});
```

```ts !!
// @errors: 2561
interface FetchOptions {
  url: string;
  timeout?: number;
}

const myFetch = (opts: FetchOptions) => {
  // implementation
};

// ---cut---
const options: FetchOptions = {
  url: "/data",
  timeOut: 2000,
};

myFetch(options);
```

```ts !!
// @errors: 2561
interface FetchOptions {
  url: string;
  timeout?: number;
}

const myFetch = (opts: FetchOptions) => {
  // implementation
};

// ---cut---
const options = {
  url: "/data",
  timeOut: 2000,
};

myFetch(options);
```

```ts !!
// @errors: 2561
interface FetchOptions {
  url: string;
  timeout?: number;
}

const myFetch = (opts: FetchOptions) => {
  // implementation
};

// ---cut---
// Not fresh!
const options = {
  url: "/data",
  timeOut: 2000,
};

myFetch(options);
```

```ts !!
// @errors: 2561
interface FetchOptions {
  url: string;
  timeout?: number;
}

const myFetch = (opts: FetchOptions) => {
  // implementation
};

// ---cut---
// Fresh!
myFetch({
  url: "/data",
  timeOut: 2000,
});
```

```ts !!
// @errors: 2561
interface FetchOptions {
  url: string;
  timeout?: number;
}

const myFetch = (opts: FetchOptions) => {
  // implementation
};

// ---cut---
// Fresh!
const options: FetchOptions = {
  url: "/data",
  timeOut: 2000,
};

myFetch(options);
```

```ts !!
// @errors: 2561
interface FetchOptions {
  url: string;
  timeout?: number;
}

const myFetch = (opts: FetchOptions) => {
  // implementation
};

// ---cut---
// Fresh!
const options = {
  url: "/data",
  timeOut: 2000,
} satisfies FetchOptions;

myFetch(options);
```

```ts !!
const users = [
  {
    name: "Matt",
    age: 20,
  },
  {
    name: "Waqas",
    age: 30,
  },
];
```

```ts !!
const users = [
  {
    name: "Matt",
    age: 20,
  },
  {
    name: "Waqas",
    age: 30,
  },
];

const usersWithNames: { name: string }[] = users;
```

```ts !!
// @errors: 2353
const users: { name: string }[] = [
  {
    name: "Matt",
    age: 20,
  },
  {
    name: "Waqas",
    age: 30,
  },
];

const usersWithNames = users;
```

```ts !!
// Not fresh:
const users = [
  {
    name: "Matt",
    age: 20,
  },
  {
    name: "Waqas",
    age: 30,
  },
];

const usersWithNames: { name: string }[] = users;
```

```ts !!
// @errors: 2353
// Fresh:
const users: { name: string }[] = [
  {
    name: "Matt",
    age: 20,
  },
  {
    name: "Waqas",
    age: 30,
  },
];

const usersWithNames = users;
```
