```ts twoslash
type AlbumAttributes = {
  status: "new-release" | "on-sale" | "staff-pick";
};

const albumAttributes: AlbumAttributes = {
  status: "on-sale",
} as const;

// We can reassign a property of an 'as const'
// object, which is not what we want.
albumAttributes.status = "new-release";
```

```ts twoslash
// @errors: 2540
type AlbumAttributes = {
  status: "new-release" | "on-sale" | "staff-pick";
};

// ---cut---

const albumAttributes = {
  status: "on-sale",
} as const satisfies AlbumAttributes;

albumAttributes.status = "new-release";
```
