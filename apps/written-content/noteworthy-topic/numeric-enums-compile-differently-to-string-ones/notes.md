```ts
// This numeric enum...
enum AlbumStatus {
  NewRelease = 0,
  OnSale = 1,
  StaffPick = 2,
}
```

```ts
// ...becomes this JavaScript. Note how the values are
// reverse mapped, meaning you end up with 6 keys:
// "0", "1", "2", "NewRelease", "OnSale", and "StaffPick"
var AlbumStatus;
(function (AlbumStatus) {
  AlbumStatus[(AlbumStatus["NewRelease"] = 0)] =
    "NewRelease";
  AlbumStatus[(AlbumStatus["OnSale"] = 1)] = "OnSale";
  AlbumStatus[(AlbumStatus["StaffPick"] = 2)] = "StaffPick";
})(AlbumStatus || (AlbumStatus = {}));
```
