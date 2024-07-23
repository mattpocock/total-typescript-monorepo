```tsx twoslash
import React from "react";

namespace MyComponent {
  export interface Props {
    id: string;
  }
}

function MyComponent(props: MyComponent.Props) {
  return <div />;
}

<MyComponent id="abc" />;
```
