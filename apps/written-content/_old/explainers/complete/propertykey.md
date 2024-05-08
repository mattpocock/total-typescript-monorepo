# `PropertyKey`

In TypeScript, `PropertyKey` is a global type in TypeScript that represents the data type of a property key. It can be a `string`, a `symbol`, or a `number`.

You don't need to import it into your project - it's available globally.

```typescript
// string | number | symbol
type Example = PropertyKey;
```

This can be useful in a sticky situation where you want to create record types with all possible keys:

```typescript
type RecordWithAllKeys = Record<
  PropertyKey,
  unknown
>;
```
