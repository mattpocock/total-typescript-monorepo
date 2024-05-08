satisfies in TypeScript has been out for a little while now.

Overall, it's been a success - but it's starting to cause some confusion.

Let's clear it up.

```typescript
const obj = {} satisfies Record<string, string>;

// Property 'id' does not exist on type '{}'.
obj.id = "123";
```

---

satisfies has added yet another tool to the TypeScript user's toolkit.

There are now _three_ ways to assign types to values.

https://twitter.com/stolinski/status/1630671037363879936

---

First, there's the humble 'colon annotation'.

This concept isn't really given a name in the TS docs, so I'll use this slightly medical name.

This lets you say 'this variable is always this type'.

```typescript
const obj: Record<string, string> = {};

obj.id = "123";
```

---

When you use a colon annotation, you're _declaring_ that the variable is that type.

That means that the thing you assign to the variable _must_ be that type.

```typescript
// Type 'number' is not assignable to type 'string'.
const str: string = 123;
```

---

This means you can actually give a variable a type that's _wider_ than the one you initially assign.

This is useful when you want to have a default which might later be reassigned.

```typescript
let id: string | number = "123";

if (typeof numericId !== "undefined") {
  id = numericId;
}
```

---

But colon annotations come with an edge-case downside.

When you use one, the type BEATS the value. That means that if you declare a wider type than you want, you're stuck with the wider type.

In this example, you don't get autocomplete on the routes object.

```typescript
const routes: Record<string, {}> = {
  "/": {},
  "/users": {},
  "/admin/users": {},
};

// No error!
routes.awdkjanwdkjn;
```

---

This is the problem satisfies was designed to solve.

When you use satisfies, the value BEATS the type. This means it infers the narrowest possible type, not the wider type you specify.

```typescript
const routes = {
  "/": {},
  "/users": {},
  "/admin/users": {},
} satisfies Record<string, {}>;

// Property 'awdkjanwdkjn' does not exist on type
// '{ "/": {}; "/users": {}; "/admin/users": {}; }'
routes.awdkjanwdkjn;
```

---

satisfies also protects you from specifying the wrong thing inside your config object.

So, colon annotations and satisfies are equally safe.

```typescript
const routes = {
  // Type 'null' is not assignable to type '{}'
  "/": null,
} satisfies Record<string, {}>;
```

---

The third way you can assign types to variables is the 'as' annotation.

Unlike satisfies and colon annotations, 'as' annotations let you lie to TypeScript.

```typescript
type User = {
  id: string;
  name: {
    first: string;
    last: string;
  };
};

const user = {} as User;

// No error! But this will break at runtime
user.name.first;
```

---

This has some limits - you can add properties to objects, but you can't convert between basic types.

For instance, you can't force TypeScript to convert a string into a number...

...except if you use the monstrous 'as-as'.

```typescript
// Conversion of type 'string' to type 'number'
// may be a mistake because neither type
// sufficiently overlaps with the other.
const str = "my-string" as number;

const str2 = "my-string" as unknown as number;
```

---

Sometimes, 'as' is needed. For instance, when you're converting an object to a known type.

```typescript
type User = {
  id: string;
  name: string;
};

// The user hasn't been constructed yet, so we need
// to use 'as' here
const userToBeBuilt = {} as User;

(["name", "id"] as const).forEach((key) => {
  // Assigning to a dynamic key!
  userToBeBuilt[key] = "default";
});
```

---

But if you're using 'as' as your default way to annotate variables, that's almost certainly wrong.

The code below might look safe, but as soon as you add another property to the User type, the defaultUser will be out of date - and won't error.

```typescript
type User = {
  id: string;
  name: string;
};

const defaultUser = {
  id: "123",
  name: "Matt",
} as User;
```

---

There's actually a secret _fourth_ way to give a type to a variable.

Don't.

TypeScript does an amazing job at inferring types for your variables.

Most of the time, you won't need to type your variables.

```typescript
const routes = {
  "/": {},
  "/users": {},
  "/admin/users": {},
};

// OK!
routes["/"];

// Property 'awdahwdbjhbawd' does not exist on type
// { "/": {}; "/users": {}; "/admin/users": {}; }
routes["awdahwdbjhbawd"];
```

---

So, we've got FOUR ways of assigning a type to a variable.

- colon annotations
- satisfies
- as annotations
- not annotating and inferring it

---

The mistake I'm seeing a lot of devs make with the release of 'satisfies' is to use it as their new default.

This is fine for simple cases like this:

```typescript
type User = {
  id: string;
  name: string;
};

const defaultUser = {
  id: "123",
  name: "Matt",
} satisfies User;
```

---

But most of the time, the times you want to assign a type to a variable are when you _want_ the type to be wider.

For instance, this case. If we used satisfies here, you wouldn't be able to assign numericId to id.

```typescript
// colon annotation

let id: string | number = "123";

if (typeof numericId !== "undefined") {
  id = numericId;
}

// satisfies

let id = "123" satisfies string | number;

if (typeof numericId !== "undefined") {
  // Type 'number' is not assignable to type 'string'.
  id = numericId;
}
```

---

So - satisfies shouldn't be your default. It's for edge cases. It should be for when:

- You want the EXACT type of the variable, not the WIDER type.
- The type is complex enough that you want to make sure you didn't mess it up

---
