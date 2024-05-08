```ts
// This string enum...
enum AlbumStatus {
  NewRelease = "new_release",
  OnSale = "on_sale",
  StaffPick = "staff_pick",
}
```

```ts
// ...becomes this JavaScript. Note how the values are
// not reverse mapped, meaning you end up with 3 keys:
// "NewRelease", "OnSale", and "StaffPick"
var AlbumStatus;
(function (AlbumStatus) {
  AlbumStatus["NewRelease"] = "new_release";
  AlbumStatus["OnSale"] = "on_sale";
  AlbumStatus["StaffPick"] = "staff_pick";
})(AlbumStatus || (AlbumStatus = {}));
```
