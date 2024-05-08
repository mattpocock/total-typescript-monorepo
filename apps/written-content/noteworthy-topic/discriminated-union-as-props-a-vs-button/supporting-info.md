```tsx twoslash
import { ReactNode } from "react";

const Button = (props: ButtonProps) => {
  if (props.as === "a") {
    return <a href={props.href}>{props.children}</a>;
  }
  return (
    <button onClick={props.onClick}>
      {props.children}
    </button>
  );
};

const showModal = () => {};

// ---cut---

type ButtonProps = (
  | {
      as: "a";
      href: string;
    }
  | {
      as: "button";
      onClick: () => void;
    }
) & {
  children?: ReactNode;
};

<>
  <Button as="a" href="/">
    Home
  </Button>
  <Button as="button" onClick={showModal}>
    Log In
  </Button>
</>;
```

```tsx twoslash
import { ReactNode, ComponentProps } from "react";

const Button = (props: ButtonProps) => {
  if (props.as === "a") {
    return <a href={props.href}>{props.children}</a>;
  }
  return (
    <button onClick={props.onClick}>
      {props.children}
    </button>
  );
};

const showModal = () => {};

// ---cut---

type ButtonProps =
  | ({
      as: "a";
    } & ComponentProps<"a">)
  | ({
      as: "button";
      onClick: () => void;
    } & ComponentProps<"button">);

<>
  <Button as="a" href="/">
    Home
  </Button>
  <Button as="button" onClick={showModal}>
    Log In
  </Button>
</>;
```

# PropsWithChildren

```tsx twoslash
import { ReactNode, PropsWithChildren } from "react";

const Button = (props: ButtonProps) => {
  if (props.as === "a") {
    return <a href={props.href}>{props.children}</a>;
  }
  return (
    <button onClick={props.onClick}>
      {props.children}
    </button>
  );
};

const showModal = () => {};

// ---cut---

type ButtonProps = PropsWithChildren<
  | {
      as: "a";
      href: string;
    }
  | {
      as: "button";
      onClick: () => void;
    }
>;

<>
  <Button as="a" href="/">
    Home
  </Button>
  <Button as="button" onClick={showModal}>
    Log In
  </Button>
</>;
```
