Unable to resolve signature of property decorator when called as an expression.

```ts twoslash
// @errors: 1240
function debug(
  originalMethod: (
    this: any,
    ...args: any[]
  ) => any,
  context: ClassMethodDecoratorContext<MyClass>
) {
  const methodName = String(context.name);

  function replacementMethod(
    this: MyClass,
    ...args: any[]
  ) {
    console.log(
      `Calling ${methodName} with`,
      ...args
    );
    const result = originalMethod.call(
      this,
      ...args
    );
    return result;
  }

  return replacementMethod;
}

// ---cut---

class MyClass {
  @debug
  log = (message: string) => {
    console.log(message);
  };
}
```
