import { JSXElementConstructor, ReactNode } from "react";

type NoInfer<T> = [T][T extends any ? 0 : 1];

type ContainsChildren = {
  children?: React.ReactNode;
};

function ProviderStack<
  Providers extends [
    ContainsChildren,
    ...ContainsChildren[]
  ]
>({
  providers,
  children,
}: {
  providers: {
    [k in keyof Providers]: [
      JSXElementConstructor<Providers[k]>,
      Omit<NoInfer<Providers[k]>, "children">
    ];
  };
  children: ReactNode;
}) {
  let node = children;

  for (const [Provider, props] of providers) {
    node = <Provider {...props}>{node}</Provider>;
  }

  return node;
}

declare function ThemeProvider(props: {
  theme: "dark" | "light";
  children: React.ReactNode;
}): JSX.Element;
declare function UserProvider(props: {
  userId: number;
  children: React.ReactNode;
}): JSX.Element;

// BEFORE

<ThemeProvider theme="dark">
  <UserProvider userId={123}>Hello World!</UserProvider>
</ThemeProvider>;

// AFTER

<ProviderStack
  providers={[
    [
      ThemeProvider,
      {
        theme: "dark",
      },
    ],
    [
      UserProvider,
      {
        userId: 123,
      },
    ],
  ]}
>
  Hello World!
</ProviderStack>;
