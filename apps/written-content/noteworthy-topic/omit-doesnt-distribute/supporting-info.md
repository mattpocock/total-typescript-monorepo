https://www.typescriptlang.org/play?#code/PTAEEFQZwSwWwA4BsCmoBGBXALtg9gHagDuM2AFtHnGgMaHYoHagCGBAJm6ABRx5RsSAJ4B+AJSgOMKLQBO8GAVaMumAjEKh8UvCTKU5KKAkKwAbmnRHWAa1NLsUAFDZhCNACEc+AgAU5PAQoUABeUABvZ1BQemYmbAAuaGwFAgBzAG5nAF9QADJeaNAAH0jQIxMzGEtRZIAzViQoNBzisoiK41MCCxRk1MwUTIwbezxHZIAiKDgp0tApuA55sqmkdPm28WznEAhQb1wtYnIYWkpMFpCKNFZ0PEtQBEDg53r1WmxNIiPfHheQSgyT+hACQMkURiRmwmDkRCmACsoAAPKbZNp7MAAFTOISwxyIMi6VV6MHQqFA9TwclAZBCeGIRDijGYABoqLoCAByFioFjsYSENAIVhQEKCukEVzuLw+MGvKAAdQMeBwAGEGAkwqAAPJwMgAHlB-kVHKmLISUwAfLsPgQvj9DvKCCqKGrsJr4swAYqQS7wcE3eQPV7WdhIcV9ri0PqjdbQOQxVSkCpWSgODwJNpyGg3B4OdYUHYlOkc2h1D9ijC4b8XTxOqAAHQtwHBDmW5jTXNIJB4LY7XLOYdAA

```ts twoslash
type DistributiveOmit<
  T,
  K extends PropertyKey
> = T extends any ? Omit<T, K> : never;

type Union =
  | {
      a: string;
      b: number;
    }
  | {
      c: boolean;
    };

type BadResult = Omit<Union, "a">;
//   ^?

type GoodResult = DistributiveOmit<Union, "a">;
//   ^?
```
