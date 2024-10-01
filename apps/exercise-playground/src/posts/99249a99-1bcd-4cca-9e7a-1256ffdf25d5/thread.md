```ts twoslash
// fetch took 8.038s ± 0.102s to make
// 100,000 GET requests
for (let i = 0; i < 100000; i++) {
  await fetch("http://localhost:3006").then(
    (res) => res.text(),
  );
}
```

```ts twoslash
import { request } from "undici";

// undici.request took 4.801s ± 0.231s, which is
// 1.67 times faster than fetch
for (let i = 0; i < 100000; i++) {
  await request("http://localhost:3006").then(
    (res) => res.body.text(),
  );
}
```
