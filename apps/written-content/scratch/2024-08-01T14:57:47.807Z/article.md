---
musicFullVolume: true
---

```ts !!
import { useState } from "react";

const [search, setSearch] = useState("");

const handleChange = (val: string) => {
  setSearch(val);
};
```

```ts !!
import { useSearchParams } from "@remix-run/react";

const [params, setSearchParams] = useSearchParams();

const handleChange = (val: string) => {
  setSearchParams((params) => {
    params.set("search", val);
    return params;
  });
};
```

```ts !!
import { useState } from "react";

const [search, setSearch] = useState("");

const handleChange = (val: string) => {
  setSearch(val);
};
```

```ts !!
import { useSearchParams } from "@remix-run/react";

const [params, setSearchParams] = useSearchParams();

const handleChange = (val: string) => {
  setSearchParams((params) => {
    params.set("search", val);
    return params;
  });
};
```
