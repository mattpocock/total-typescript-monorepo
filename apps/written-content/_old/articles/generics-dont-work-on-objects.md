```typescript
type User = {
  name: string;
  age: number;
  admin: boolean;
};

type SetValue<TKey extends keyof User> = {
  key: TKey;
  value: User[TKey];
};

const valueToSet: SetValue = {
  key: "admin",
  value: "test", // This should be showing an error as it should be a boolean
};
```
