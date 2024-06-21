---
height: 1200
---

```ts !!
// @errors: 2322
// Let's create an ObjWithMethod type, which contains
// a method that takes an object with an id property...
type ObjWithMethod = {
  method: (input: { id: string }) => void;
};
```

```ts !!
// @errors: 2322
type ObjWithMethod = {
  method: (input: { id: string }) => void;
};

// Then, we'll create an object typed as
// ObjWithMethod.
const objWithMethod: ObjWithMethod = {
  method: (input) => {},
};
```

```ts !!
// @errors: 2322
type ObjWithMethod = {
  method: (input: { id: string }) => void;
};

const objWithMethod: ObjWithMethod = {
  method: (input) => {
    // We don't need to add a type annotation
    // to the function, since it's inferred
    // from the type of the object.
    console.log(input);
    //          ^?
  },
};
```

```ts !!
// @noErrors
type ObjWithMethod = {
  method: (input: { id: string }) => void;
};

const objWithMethod: ObjWithMethod = {
  // But, what if we add a property,
  // user, that doesn't exist in
  // ObjWithMethod.method?
  method: (input: {
    id: string;
    user: {
      name: string;
    };
  }) => {},
};
```

```ts !!
// @errors: 2322
type ObjWithMethod = {
  method: (input: { id: string }) => void;
};

const objWithMethod: ObjWithMethod = {
  // Of course, we get a gnarly error.
  method: (input: {
    id: string;
    user: {
      name: string;
    };
  }) => {},
};
```

```ts !!
// @errors: 2322
type ObjWithMethod = {
  // But if we change the method to method shorthand
  // syntax...
  method(input: { id: string }): void;
};

const objWithMethod: ObjWithMethod = {
  // ...we don't get an error. WTF?
  method: (input: {
    id: string;
    user: {
      name: string;
    };
  }) => {},
};
```

```ts !!
// @errors: 2322
type ObjWithMethod = {
  method(input: { id: string }): void;
};

const objWithMethod: ObjWithMethod = {
  method: (input: {
    id: string;
    user: {
      name: string;
    };
  }) => {
    // This can cause runtime errors from
    // accessing properties that don't exist.
    console.log(input.user.name);
  },
};
```

```ts !!
// @errors: 2322
type ObjWithMethod = {
  // So - avoid method shorthand syntax...
  method(input: { id: string }): void;
};

const objWithMethod: ObjWithMethod = {
  method: (input: {
    id: string;
    user: {
      name: string;
    };
  }) => {
    console.log(input.user.name);
  },
};
```

```ts !!
// @errors: 2322
type ObjWithMethod = {
  // ...and use object property syntax instead.
  method: (input: { id: string }) => void;
};

const objWithMethod: ObjWithMethod = {
  method: (input: {
    id: string;
    user: {
      name: string;
    };
  }) => {
    console.log(input.user.name);
  },
};
```
