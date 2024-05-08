```ts twoslash
interface Dog {
  // 1. barkAt is bivariant - meaning it can either
  // receive arguments which are wider AND narrower
  // than Dog
  barkAt(dog: Dog): void;
}

// 2. We create a type which is narrower than Dog -
// it can whimper
interface SmallDog extends Dog {
  whimper: () => void;
}

const brian: Dog = {
  // 3. We add a type annotation to barkAt which
  // calls the .whimper() function.
  // In other words, brian only barks at dogs that
  // will whimper back.
  barkAt(dog: SmallDog) {
    dog.whimper();
  },
};

// 4. This is just a plain old dog - no whimpering
const dog: Dog = {
  barkAt() {},
};

// 5. Brian barks at the dog, attempting to call
// dog.whimper(). It fails at runtime.
brian.barkAt(dog);
```
