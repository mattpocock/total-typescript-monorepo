I feel like we need a better name for '{}' in TS.

People think it's an 'empty object', but it's not - it's really 'anything except null or undefined'.

What should we call it?

```ts twoslash
// @errors: 2345
const acceptsAnyNonNullishValue = (input: {}) => {};

acceptsAnyNonNullishValue("hello");
acceptsAnyNonNullishValue(123);
acceptsAnyNonNullishValue(false);

acceptsAnyNonNullishValue(null);

acceptsAnyNonNullishValue(undefined);
```
