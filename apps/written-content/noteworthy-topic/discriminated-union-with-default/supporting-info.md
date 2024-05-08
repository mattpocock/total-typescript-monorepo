```ts twoslash
type DTO =
  | {
      version: undefined; // version 0
      name: string;
    }
  | {
      version: 1;
      firstName: string;
      lastName: string;
    }
  // Even later
  | {
      version: 2;
      firstName: string;
      middleName: string;
      lastName: string;
    };
// So on
```
