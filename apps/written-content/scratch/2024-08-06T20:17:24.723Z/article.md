Node 22.6.0 just added TypeScript support 🔥

if you're planning to use it, you'll need these two lines in your tsconfig.json.

Brief explainer in a 🧵

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "allowImportingTsExtensions": true
  }
}
```

---

module: "NodeNext" tells TypeScript that the code you're writing will be run by Node.js.

This means it forces you to add `.js` extensions to your imports.

```ts twoslash
// @noErrors
import { foo } from "./foo.js";
```

---

But `allowImportingTsExtensions` tells TypeScript that instead of using `.js` extensions, you can use `.ts` ones instead.

I just tested it, and it handles auto imports too!

```ts twoslash
// @noErrors
import { foo } from "./foo.ts";
```

---

This is massively important for --experimental-strip-types, because there's no `.js` file being created.

So you have to point to the `.ts` files directly.
