```ts twoslash
// 1. Create an interface with a readonly
// property of id
interface User {
  readonly id: string;
}

// 2. Create an object with a readonly id
const user: User = {
  id: "123",
};

// 3. Create a function which modifies
// that id at runtime
const modifyId = (obj: { id: string }) => {
  obj.id = "456";
};

// 4. Pass the readonly object to function
// that mutates it. NO ERROR. WTF?
modifyId(user);

// 5. And just like that, we've modified
// our supposedly 'readonly' property
console.log(user.id); // '456'
```
