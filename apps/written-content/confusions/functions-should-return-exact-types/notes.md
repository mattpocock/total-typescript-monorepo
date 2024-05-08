```ts twoslash
declare const returnWhatIWant: (
  func: () => { id: string }
) => { id: string };

returnWhatIWant(() => ({
  id: "123",
  // How do I prevent this?
  notRequired: "foo",
}));
```
