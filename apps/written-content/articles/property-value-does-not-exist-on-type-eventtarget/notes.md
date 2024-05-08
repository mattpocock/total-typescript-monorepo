## Problem

```tsx twoslash
// @errors: 2339
import { ChangeEvent } from "react";

const onChange = (e: ChangeEvent) => {
  console.log(e.target.value);
};

<input onChange={onChange} />;
```

## Solution 1: Cast the event target

```tsx twoslash
import { ChangeEvent } from "react";

const onChange = (e: ChangeEvent) => {
  console.log((e.target as HTMLInputElement).value);
};

<input onChange={onChange} />;
```

## Solution 2: Specify a better type for the event

```tsx twoslash
import { ChangeEvent } from "react";

const onChange = (e: ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};

<input onChange={onChange} />;
```

## Solution 3: Inline the function

```tsx twoslash
<input
  onChange={(e) => {
    console.log(e.target.value);
  }}
/>
```
