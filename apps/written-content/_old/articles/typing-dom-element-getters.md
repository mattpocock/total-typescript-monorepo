Do getElementsByClassName (and similar functions like getElementsByTagName and querySelectorAll) work the same as getElementById or do they return an array of elements?

The reason I ask is because I am trying to change the style of all elements using getElementsByClassName. See below.

```ts
//doesn't work
document.getElementsByClassName(
  "myElement"
).style.size = "100px";

//works
document.getElementById(
  "myIdElement"
).style.size = "100px";
```
