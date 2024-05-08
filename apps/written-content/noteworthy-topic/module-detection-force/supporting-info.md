Ever seen an error like this and wondered why it happens?

You're missing a really nice tsconfig.json option.

And no, it's not "isolatedModules".

```ts twoslash
// @errors: 2451
const name = {};
```

---

Folks forget that, for most of TypeScript's life, we didn't have imports and exports.

You'd write a _script_ and pull it in to the browser via a script tag.

Everything global, all the time.

---

So if TypeScript doesn't see an import or export in your file, it assumes it's global.

And guess what - 'name' is a global in the browser, same as 'window' and 'document'.

```ts twoslash
// @errors: 2451
const name = {};

const window = {};

const document = {};
```

---

So how do you tell TypeScript that you're in a project that uses modules?

It's not "isolatedModules" - that's not quite enough.

You can set "moduleDetection": "force" in your tsconfig.json.

```json
{
  "compilerOptions": {
    "moduleDetection": "force"
  }
}
```

---

Now, TypeScript will assume that your file is a module, and not a script.

That means your variables are in module scope, not global scope - and you won't get those errors.

```ts twoslash
// @moduleDetection: force

const name = {};

const window = {};

const document = {};
```

---

Yes, you could just import something. But guess what - the fewer random errors in your codebase, the better.

Pretty much all module-based projects should have this option set - and a lot of folks don't know about it!
