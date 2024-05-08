🔥 TypeScript Tip 🔥

A little gotcha with TypeScript is that tuples can be passed to arrays.

This means that TS won't yell at you if you mutate a tuple inside a function.

Using 'readonly' on your tuples can REALLY help.

```ts twoslash
type Coordinate = [number, number];
const myHouse: Coordinate = [0, 0];

const dangerousFunction = (arrayOfNumbers: number[]) => {
  arrayOfNumbers.pop();
  arrayOfNumbers.pop();
};

// Oh dear, now myHouse is now an empty array,
// but TypeScript thinks it's a tuple!
dangerousFunction(myHouse);
```

```ts twoslash
// @errors: 2345
// Specifying it as a readonly tuple makes this error!
type Coordinate = readonly [number, number];

const myHouse: Coordinate = [0, 0];

const dangerousFunction = (arrayOfNumbers: number[]) => {
  arrayOfNumbers.pop();
  arrayOfNumbers.pop();
};

dangerousFunction(myHouse);
```
