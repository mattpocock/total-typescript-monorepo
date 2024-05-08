https://twitter.com/heyImMapleLeaf/status/1674833152450215950

```ts twoslash
const raise = (err: string): never => {
  throw new Error(err);
};

const Page = (props: {
  params: {
    id?: string;
  };
}) => {
  const id = props.params.id ?? raise("No id provided");
};
```

```ts
function raise(err: string): never;
```
