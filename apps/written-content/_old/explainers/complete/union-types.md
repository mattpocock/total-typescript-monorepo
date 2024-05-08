---
summary: "Union types let you express types that could be one of several different things."
---

# Union Types

In TypeScript, union types let you express types that could be one of several different things.

Here's an example of a union type in a function argument:

```typescript
function printId(id: string | number) {
  console.log(`ID is: ${id}`);
}

printId("abc"); // Outputs: ID is: abc
printId(123); // Outputs: ID is: 123
```

In the example above, the `id` parameter can be either a `string` or a `number`.

Union types can be used with any type, including literals:

```typescript
type Status = "success" | "failure";

function printStatus(status: Status) {
  console.log(`Status is: ${status}`);
}

printStatus("success"); // Outputs: Status is: success
printStatus("error"); // Type error!
```

As you can see, union types provide a level of type safety that `any` type lacks. It prevents errors at compile-time, reducing the chances of runtime issues.

You can include as many members as you want in a union type:

```typescript
type MassiveUnionType =
  | "animal"
  | {
      whatever: string;
    }
  | boolean
  | (() => void)
  | 100
  | "other string";
```

## Examples of Union Types

Here's a list of things you could use union types for in TypeScript:

```typescript
type HTTPRequestMethods =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE";
```

```typescript
type CSSLengthUnits =
  | "em"
  | "ex"
  | "ch"
  | "rem"
  | "vw"
  | "vh"
  | "vmin"
  | "vmax"
  | "px"
  | "cm"
  | "mm"
  | "in"
  | "pt"
  | "pc";
```

```typescript
type UserRoles =
  | "admin"
  | "editor"
  | "contributor"
  | "subscriber";
```

```typescript
type PaymentMethods =
  | "credit_card"
  | "debit_card"
  | "paypal"
  | "bank_transfer";
```

```typescript
type HTTPResponseStatusCodes =
  | 200
  | 201
  | 400
  | 401
  | 403
  | 404
  | 500;
```

```typescript
type NavigationalDirections =
  | "north"
  | "south"
  | "east"
  | "west";
```

```typescript
type SocialMediaButtonsIcons =
  | "facebook"
  | "twitter"
  | "instagram"
  | "pinterest"
  | "linkedin";
```

```typescript
type TimeZones =
  | "GMT"
  | "EST"
  | "CST"
  | "PST"
  | "JST"
  | "AEST"
  | "CET"
  | "EET"
  | "IST";
```
