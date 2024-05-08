```tsx
import React from "react";

type ButtonOrLinkProps =
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | React.AnchorHTMLAttributes<HTMLAnchorElement>;

const ButtonOrLink = (props: ButtonOrLinkProps) => {
  if ("href" in props) {
    return <a {...props} />;
  }
  return <button {...props} />;
};
```

```tsx twoslash
// @errors: 2322
import React from "react";

type ButtonOrLinkProps =
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | React.AnchorHTMLAttributes<HTMLAnchorElement>;

const ButtonOrLink = (props: ButtonOrLinkProps) => {
  if ("href" in props) {
    return <a {...props} />;
  }
  return <button {...props} />;
};
```

```tsx twoslash
// @errors: 2322
import React from "react";

type ButtonOrLinkProps =
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | AnchorPropsWithRequiredHref;

type AnchorPropsWithRequiredHref =
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const ButtonOrLink = (props: ButtonOrLinkProps) => {
  if ("href" in props) {
    return <a {...props} />;
  }
  return <button {...props} />;
};
```

```tsx twoslash
// @errors: 2322
import React from "react";

type ButtonOrLinkProps =
  | (React.ButtonHTMLAttributes<HTMLButtonElement> & {
      href?: undefined;
    })
  | AnchorPropsWithRequiredHref;

type AnchorPropsWithRequiredHref =
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const ButtonOrLink = (props: ButtonOrLinkProps) => {
  if (props.href != null) {
    return <a {...props} />;
  }
  return <button {...props} />;
};

<ButtonOrLink href="/" onClick={(e) => {}} />;
```

```tsx twoslash
// @errors: 7006
import React from "react";

type ButtonOrLinkProps =
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | AnchorPropsWithRequiredHref;

type AnchorPropsWithRequiredHref =
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const ButtonOrLink = (props: ButtonOrLinkProps) => {
  if ("href" in props) {
    return <a {...props} />;
  }
  return <button {...props} />;
};

// ---cut---

<ButtonOrLink href="/" onClick={(e) => {}} />;
```

```tsx twoslash
import React from "react";

type ButtonOrLinkProps =
  | (React.ButtonHTMLAttributes<HTMLButtonElement> & {
      as: "button";
    })
  | (React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      as: "a";
    });

const ButtonOrLink = (props: ButtonOrLinkProps) => {
  if (props.as === "a") {
    return <a {...props} />;
  }
  return <button {...props} />;
};
```

```tsx twoslash
import React from "react";

type ButtonOrLinkProps =
  | (React.ButtonHTMLAttributes<HTMLButtonElement> & {
      as: "button";
    })
  | (React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      as: "a";
    });

const ButtonOrLink = (props: ButtonOrLinkProps) => {
  if (props.as === "a") {
    return <a {...props} />;
  }
  return <button {...props} />;
};

// ---cut---

<ButtonOrLink
  as="a"
  href="/"
  onClick={(e) => {
    console.log(e);
    //          ^?
  }}
/>;

<ButtonOrLink
  as="button"
  onClick={(e) => {
    console.log(e);
    //          ^?
  }}
/>;
```

```tsx twoslash
import React from "react";

type ButtonOrLinkProps =
  | (React.ButtonHTMLAttributes<HTMLButtonElement> & {
      as?: "button";
    })
  | (React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      as: "a";
    });

const ButtonOrLink = (props: ButtonOrLinkProps) => {
  if (props.as === "a") {
    return <a {...props} />;
  }
  return <button {...props} />;
};
```

```tsx twoslash
import React from "react";

type ButtonOrLinkProps =
  | (React.ButtonHTMLAttributes<HTMLButtonElement> & {
      as?: "button";
    })
  | (React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      as: "a";
    });

const ButtonOrLink = (props: ButtonOrLinkProps) => {
  if (props.as === "a") {
    return <a {...props} />;
  }
  return <button {...props} />;
};

// ---cut---

<ButtonOrLink
  onClick={(e) => {
    console.log(e);
    //          ^?
  }}
/>;

<ButtonOrLink
  as="a"
  onClick={(e) => {
    console.log(e);
    //          ^?
  }}
/>;
```
