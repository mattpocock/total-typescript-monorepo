### Examples of using 'as const' in TypeScript

#### Example 1

```typescript
const user = {
  name: "John",
  age: 30,
  address: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
  },
} as const;
```

#### Benefit:

This ensures that the values of the `user` object are read-only and cannot be modified.

#### Example 2

```typescript
const fruits = [
  "apple",
  "banana",
  "orange",
] as const;
```

#### Benefit:

This ensures that the `fruits` array is read-only and cannot be modified.

#### Example 3

```typescript
const actionCreators = {
  increment: "INCREMENT" as const,
  decrement: "DECREMENT" as const,
};
```

#### Benefit:

This ensures that the action types are read-only and cannot be modified.

### Examples that are useful for application development

#### Example 4

```typescript
const colors = [
  { name: "red", code: "#ff0000" },
  { name: "green", code: "#00ff00" },
  { name: "blue", code: "#0000ff" },
] as const;
```

#### Benefit:

This ensures that the color values are read-only and cannot be accidentally modified in the application.

#### Example 5

```typescript
const actionTypes = {
  login: "LOGIN" as const,
  logout: "LOGOUT" as const,
  fetchData: "FETCH_DATA" as const,
  updateData: "UPDATE_DATA" as const,
} as const;
```

#### Benefit:

This ensures that the action types of the application are read-only and cannot be modified or misspelled.

### Making types out of 'as const' code using 'typeof'

#### Example 6

```typescript
const colors = [
  { name: "red", code: "#ff0000" },
  { name: "green", code: "#00ff00" },
  { name: "blue", code: "#0000ff" },
] as const;

type Color = (typeof colors)[number];
```

#### Benefit:

By using `typeof colors[number]` we create a union type of the possible values of the `colors` array, which in this case is `{ name: 'red', code: '#ff0000' } | { name: 'green', code: '#00ff00' } | { name: 'blue', code: '#0000ff' }`.

#### Example 7

```typescript
const actionTypes = {
  login: "LOGIN" as const,
  logout: "LOGOUT" as const,
  fetchData: "FETCH_DATA" as const,
  updateData: "UPDATE_DATA" as const,
} as const;

type ActionType =
  (typeof actionTypes)[keyof typeof actionTypes];
```

#### Benefit:

By using `typeof actionTypes[keyof typeof actionTypes]` we create a union type of the possible values of the `actionTypes` object, which in this case is `'LOGIN' | 'LOGOUT' | 'FETCH_DATA' | 'UPDATE_DATA'`.

#### Example 8

```typescript
const menuItems = [
  { title: "Home", link: "/" },
  { title: "About", link: "/about" },
  { title: "Contact", link: "/contact" },
  { title: "Blog", link: "/blog" },
] as const;
```

#### Benefit:

This ensures that the menu items in the application are read-only and cannot be modified accidentally.

#### Example 9

```typescript
const statusCodes = {
  success: 200 as const,
  notFound: 404 as const,
  serverError: 500 as const,
} as const;
```

#### Benefit:

This ensures that the HTTP status codes are read-only and cannot be modified or misspelled in the application.

#### Example 10

```typescript
const socialMedia = {
  facebook: "https://www.facebook.com" as const,
  twitter: "https://www.twitter.com" as const,
  instagram: "https://www.instagram.com" as const,
  linkedin: "https://www.linkedin.com" as const,
} as const;
```

#### Benefit:

This ensures that the social media links in the application are read-only and cannot be modified or misspelled.
