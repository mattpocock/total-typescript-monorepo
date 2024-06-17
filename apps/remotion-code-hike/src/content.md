```ts !!
// How do we turn this type...
type BackendObj = {
  id: string;
  name: string;
  email: string;
};

// ...into this - programmatically?
type Target = {
  getId: () => string;
  getName: () => string;
  getEmail: () => string;
};
```

```ts !!
type BackendObj = {
  id: string;
  name: string;
  email: string;
};

// First, create a mapped type...
type NewObj = {
  [K in keyof BackendObj]: BackendObj[K];
};

type Target = NewObj;
//   ^?
```

```ts !!
type BackendObj = {
  id: string;
  name: string;
  email: string;
};

// Then, remap the key of the mapped type...
type NewObj = {
  [K in keyof BackendObj as `get${K}`]: BackendObj[K];
};

type Target = NewObj;
//   ^?
```

```ts !!
type BackendObj = {
  id: string;
  name: string;
  email: string;
};

// Remember to capitalize the key!
type NewObj = {
  [K in keyof BackendObj as `get${Capitalize<K>}`]: BackendObj[K];
};

type Target = NewObj;
//   ^?
```

```ts !!
type BackendObj = {
  id: string;
  name: string;
  email: string;
};

// And turn the value into a function...
type NewObj = {
  [K in keyof BackendObj as `get${Capitalize<K>}`]: () => BackendObj[K];
};

// ...and we're done!
type Target = NewObj;
//   ^?
```
