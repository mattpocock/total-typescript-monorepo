```tsx !!
import React from "react";

// ---cut---
// Here's a standard setup for a component and props.
// But there's another way to express this.
export interface MyComponentProps {
  id: string;
}

export function MyComponent(props: MyComponentProps) {
  return <div />;
}
```

```tsx !!
// @noErrors
import React from "react";

// ---cut---
// Let's turn this into a namespace with the same name
// as the component, and move the props inside.
namespace MyComponent {
  export interface Props {
    id: string;
  }
}

export function MyComponent(props: MyComponentProps) {
  return <div />;
}
```

```tsx !!
import React from "react";

// ---cut---
namespace MyComponent {
  export interface Props {
    id: string;
  }
}

// Now, let's change the props to MyComponent.Props.
export function MyComponent(props: MyComponent.Props) {
  return <div />;
}
```

```tsx !!
import React from "react";

// ---cut---
namespace MyComponent {
  export interface Props {
    id: string;
  }
}

export function MyComponent(props: MyComponent.Props) {
  return <div />;
}

// This means that users of our function don't need to
// import a separate interface - it's already there.
const WrapperComponent = (props: MyComponent.Props) => {
  return <MyComponent {...props} />;
};
```

```tsx !!
import React from "react";

// ---cut---
// Here's the before...
export interface MyComponentProps {
  id: string;
}

export function MyComponent(props: MyComponentProps) {
  return <div />;
}
```

```tsx !!
import React from "react";

// ---cut---
// ...and here's the after.
namespace MyComponent {
  export interface Props {
    id: string;
  }
}

export function MyComponent(props: MyComponent.Props) {
  return <div />;
}
```
