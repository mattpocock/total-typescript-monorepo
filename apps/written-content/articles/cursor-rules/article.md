Since the AI-assisted development era began, I have had dozens and dozens of requests to share my `.cursor/rules` for writing TypeScript code.

So, this article will be a space where I iterate on the rules I have, and share them with you.

I don't yet believe I've come up with the perfect set of rules. I will likely be tinkering with these for years to come.

But for now, I'll share what I have.

## Before We Start

- Some of these rules require you to go through and manually delete some of the options, depending on settings you have in your `tsconfig.json`.
- Some of the rules are very opinionated.
- Some of the rules are not really rules, but information that the AI may not know.

## General

```md
# Types Vs Interfaces

- ALWAYS use interfaces for declaring simple object types
- ALWAYS use interfaces for
```

## Module Resolution

````md
# Return Types

When declaring functions on the top-level of a module,
declare their return types. This will help future AI
assistants understand the function's purpose.

```ts
const myFunc = (): string => {
  return "hello";
};
```

One exception to this is components which return JSX.
No need to declare the return type of a component,
as it is always JSX.

```tsx
const MyComponent = () => {
  return <div>Hello</div>;
};
```
````
