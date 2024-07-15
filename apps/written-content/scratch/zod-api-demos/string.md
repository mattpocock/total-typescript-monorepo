---
width: 1080
height: 1080
music: true
slideDuration: 300
---

```ts !!
import { z } from "zod";

// Basic string schema
const Schema = z.string();

// throws ZodError
Schema.parse(123);

// 'Hello!'
Schema.parse("Hello!");
```

```ts !!
import { z } from "zod";

// String with minimum length of 12
const Schema = z.string().min(12);

// throws ZodError
Schema.parse("Hello!");

// "Hello, world!"
Schema.parse("Hello, world!");
```

```ts !!
import { z } from "zod";

// Date format
const Schema = z.string().date();

// throws ZodError
Schema.parse("2024-07-15T15:49:18.941Z");

// '2024-07-15'
Schema.parse("2024-07-15");
```

```ts !!
import { z } from "zod";

// Datetime format
const Schema = z.string().datetime();

// '2024-07-15T15:49:18.941Z'
Schema.parse("2024-07-15T15:49:18.941Z");

// throws ZodError
Schema.parse("2024-07-15");
```

```ts !!
import { z } from "zod";

// URL format
const Schema = z.string().url();

// "https://www.youtube.com"
Schema.parse("https://www.youtube.com");

// throws ZodError
Schema.parse("not-a-url");
```

```ts !!
import { z } from "zod";

// Email format
const Schema = z.string().email();

// "example@email.com"
Schema.parse("example@email.com");

// throws ZodError
Schema.parse("not-an-email");
```

```ts !!
import { z } from "zod";

// Trimmed string
const Schema = z.string().trim();

// "hello!"
Schema.parse("   hello!     ");
```

```ts !!
import { z } from "zod";

// Lots of id schemas!
const uuidSchema = z.string().uuid();
const nanoidSchema = z.string().nanoid();
const cuidSchema = z.string().cuid();
const cuid2Schema = z.string().cuid2();
const ulidSchema = z.string().ulid();
```
