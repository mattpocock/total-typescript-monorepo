```ts twoslash
// @errors: 2558
const audioElement =
  document.getElementById<HTMLAudioElement>("player");

console.log(audioElement);
//          ^?
```

```ts twoslash
const audioElement =
  document.querySelector<HTMLAudioElement>("#player");

console.log(audioElement);
//          ^?
```
