```ts twoslash
type Result<TData, TError> =
  | {
      success: true;
      data: TData;
    }
  | {
      success: false;
      error: TError;
    };

type GetResultData<T> =
  T extends Result<infer TData, any> ? TData : never;

type Success = Result<string, boolean>;

type StringResult = GetResultData<Success>;
//   ^?
```
