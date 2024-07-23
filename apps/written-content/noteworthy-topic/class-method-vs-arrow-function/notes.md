```ts twoslash
class Example {
  location = "Class";

  bound() {
    console.log("bound", this);
  }

  constructor() {
    this.bound = this.bound.bind(this);
  }
}

const obj = {
  location: "Object",
  bound: new Example().bound,
};

obj.bound(); // { location: 'Class' }
```

```ts twoslash
class Example {
  location = "Class";

  arrow = () => {
    console.log("arrow", this);
  };

  method() {
    console.log("method", this);
  }

  boundMethod() {
    console.log("boundMethod", this);
  }

  constructor() {
    this.bound = this.bound.bind(this);
  }
}

const example = new Example();

const obj = {
  location: "Object",
  arrow: example.arrow,
  method: example.method,
};

obj.arrow(); // { location: 'Class' }
obj.method(); // { location: 'Object' }
```
