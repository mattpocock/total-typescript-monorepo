Here's a list of use cases for the type helper React.ComponentProps<T>, with accompanying code examples in markdown:

- Use case: using a third-party component with custom props

  ```tsx
  import ThirdPartyComponent from "third-party";

  interface CustomProps {
    foo: string;
    bar: number;
  }

  const MyComponent = ({
    foo,
    bar,
    ...props
  }: CustomProps &
    React.ComponentProps<
      typeof ThirdPartyComponent
    >) => {
    // use foo and bar here as needed
    return <ThirdPartyComponent {...props} />;
  };
  ```

- Use case: extending a native component with additional props

  ```tsx
  type CustomProps {
    text: string;
  }

  const Div = ({
    text,
    ...props
  }: CustomProps &
    React.ComponentProps<"div">) => {
    // Access text here
    return <div {...props}></div>;
  };
  ```

  This can also be done via an interface:

  ```tsx
  interface CustomProps
    extends React.ComponentProps<"div"> {
    text: string;
  }

  const Div = ({
    text,
    ...props
  }: CustomProps) => {
    // Access text here
    return <div {...props}></div>;
  };
  ```
