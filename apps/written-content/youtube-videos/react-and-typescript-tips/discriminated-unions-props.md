```tsx !!
// @errors: 2322
import "react";
// ---cut---
type ModalProps =
  | {
      variant: "with-title";
      title: string;
    }
  | {
      variant: "no-title";
    };

const Modal = (props: ModalProps) => {
  return <div />; // ...implementation
};

// ---cut---
// We're trying to design a component which has
// multiple 'variants', and each variant needs
// different props.
<Modal variant="with-title" title="Delete Org" />;
```

```tsx !!
// @errors: 2322
import "react";
// ---cut---
type ModalProps =
  | {
      variant: "with-title";
      title: string;
    }
  | {
      variant: "no-title";
    };

const Modal = (props: ModalProps) => {
  return <div />; // ...implementation
};

// ---cut---
// The first is the 'with-title' variant, where
// you must pass a title along with it.
<Modal variant="with-title" title="Delete Org" />;
```

```tsx !!
// @errors: 2322
import "react";
// ---cut---
type ModalProps =
  | {
      variant: "with-title";
      title: string;
    }
  | {
      variant: "no-title";
    };

const Modal = (props: ModalProps) => {
  return <div />; // ...implementation
};

// ---cut---
// And the second is the 'no-title' variant.
<Modal variant="no-title" />;
```

```tsx !!
// @errors: 2322
import "react";
// ---cut---
type ModalProps =
  | {
      variant: "with-title";
      title: string;
    }
  | {
      variant: "no-title";
    };

const Modal = (props: ModalProps) => {
  return <div />; // ...implementation
};

// ---cut---
// This should be an error, because
// 'with-title' requires a title
<Modal variant="with-title" />;
```

```tsx !!
// @errors: 2322
import "react";
// ---cut---
type ModalProps =
  | {
      variant: "with-title";
      title: string;
    }
  | {
      variant: "no-title";
    };

const Modal = (props: ModalProps) => {
  return <div />; // ...implementation
};

// ---cut---
// And this one should also be an error,
// for the reverse reason.
<Modal variant="no-title" title="Delete Org" />;
```

```tsx !!
// @errors: 2322
import "react";
// ---cut---

const Modal = (props: ModalProps) => {
  return <div />; // ...implementation
};

// ---cut---
// Having an optional 'title' attribute
// on the props seems to work OK.
type ModalProps = {
  variant: string;
  title?: string;
};
```

```tsx !!
// @errors: 2322
import "react";
// ---cut---

const Modal = (props: ModalProps) => {
  return <div />; // ...implementation
};

// ---cut---
type ModalProps = {
  variant: string;
  title?: string;
};

// Both of the 'correct' variants seem happy:
<Modal variant="with-title" title="Delete Org" />;
<Modal variant="no-title" />;
```

```tsx !!
// @errors: 2322
import "react";
// ---cut---

const Modal = (props: ModalProps) => {
  return <div />; // ...implementation
};

// ---cut---
type ModalProps = {
  variant: string;
  title?: string;
};

// But if we check the incorrect variants, they
// don't error as we expect.
<Modal variant="no-title" title="Delete Org" />;
<Modal variant="with-title" />;
```

```tsx !!
// @errors: 2322
import "react";
// ---cut---

const Modal = (props: ModalProps) => {
  return <div />; // ...implementation
};

// ---cut---
// We can fix this by changing ModalProps
// to be a discriminated union.
type ModalProps =
  | {
      variant: "with-title";
      title: string;
    }
  | {
      variant: "no-title";
    };
```

```tsx !!
// @errors: 2322
import "react";
// ---cut---

const Modal = (props: ModalProps) => {
  return <div />; // ...implementation
};

// ---cut---
type ModalProps =
  | {
      variant: "with-title";
      title: string;
    }
  | {
      variant: "no-title";
    };

// Now, the correct combinations are happy:
<Modal variant="with-title" title="Delete Org" />;
<Modal variant="no-title" />;
```

```tsx !!
// @errors: 2322
import "react";
// ---cut---

const Modal = (props: ModalProps) => {
  return <div />; // ...implementation
};

// ---cut---
type ModalProps =
  | {
      variant: "with-title";
      title: string;
    }
  | {
      variant: "no-title";
    };

// ---cut---
// The 'no-title' doesn't allow a 'title'
// to be passed:
<Modal variant="no-title" title="Delete Org" />;
```

```tsx !!
// @errors: 2322
import "react";
// ---cut---

const Modal = (props: ModalProps) => {
  return <div />; // ...implementation
};

type ModalProps =
  | {
      variant: "with-title";
      title: string;
    }
  | {
      variant: "no-title";
    };

// ---cut---
// And 'with-title' requires you to pass a
// title.
<Modal variant="with-title" />;
```
