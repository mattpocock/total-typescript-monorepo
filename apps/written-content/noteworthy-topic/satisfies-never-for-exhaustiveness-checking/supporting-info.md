```ts twoslash
// @errors: 1360
type Circle = {
  kind: "circle";
  radius: number;
};

type Square = {
  kind: "square";
  sideLength: number;
};

type Triangle = {
  kind: "triangle";
  sideLength: number;
};

type Shape = Circle | Square | Triangle;

// ---cut---

function calculateArea(shape: Shape) {
  switch (shape.kind) {
    case "circle": {
      return Math.PI * shape.radius * shape.radius;
    }
    case "square": {
      return shape.sideLength * shape.sideLength;
    }
  }
  shape satisfies never;
}
```
