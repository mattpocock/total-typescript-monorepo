```tsx twoslash
import React, { ComponentProps } from "react";

type Props =
  | ({ href: string } & ComponentProps<"a">)
  | ({ href?: undefined } & ComponentProps<"button">);

const Button = (props: Props) => {
  return null;
};

<Button
  onClick={(e) => {
    console.log(e);
    //          ^?
  }}
/>;
```
