```ts twoslash
// id initially looks like an 'any'...
let id;
//  ^?

// But after assigning it, it's a number!
id = 1;
console.log(id);
//          ^?

// Assign it again, and it's a string!
id = "abc";
console.log(id);
//          ^?
```
