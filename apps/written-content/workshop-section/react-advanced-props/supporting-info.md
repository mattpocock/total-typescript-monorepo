```ts twoslash
type WithStateProps = {
  withRouter?: never;
  baseUrl?: never;
  tabs: ItemWithState[];
};

type WithRouterProps = {
  withRouter: boolean;
  baseUrl?: string;
  tabs: ItemWithRouter[];
};

type TabsProps = WithStateProps | WithRouterProps;

const Tabs = (props: TabsProps) => {
  const { withRouter } = props;
  if (withRouter) {
    return <TabsWithRouter {...props} />;
  }
  return <TabsWithState {...props} />;
};
```

```tsx twoslash
type AnchorProps = {
  kind: "anchor";
  href: string;
  target: string;
};

type ButtonProps = {
  kind: "button";
  onClick: VoidFunction;
};

type Props = AnchorProps | ButtonProps;

const Button = (props: Props) => {
  switch (props.kind) {
    case "button":
      return (
        <button onClick={props.onClick}>
          Click Me!
        </button>
      );
    case "anchor":
      return (
        <a
          href={props.href}
          target={props.target}
        >
          Click Me!
        </a>
      );
    default:
      throw new Error("Unexpected value.");
  }
};
```
