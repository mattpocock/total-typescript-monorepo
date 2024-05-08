---
summary: "TypeScript uses its Language Service to continuously check your code in the background of your IDE, making it easier to detect and correct errors."
---

## How TypeScript works in your IDE

TypeScript works in the background of your IDE to provide you with information about your code.

When you open a TypeScript file in an IDE like VSCode, the IDE automatically starts the TypeScript Language Service. This is a persistent process that watches you code, and provides feedback based on changes.

This is different from when you run `tsc` in your terminal - `tsc` is a just a one-time process that typechecks (and perhaps compiles) your code. The TypeScript Language Service is a persistent process that runs in the background of your IDE.

```typescript
function add(a: number, b: string) {
  return a + b;
}

add(1, 2);
```

The above code will produce an error because `b` is declared as a string, but we are trying to add it to a number. The TypeScript Language Service will highlight this error in the code and provide a detailed explanation of the error message.
