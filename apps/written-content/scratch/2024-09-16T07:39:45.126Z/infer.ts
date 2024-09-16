type Result<TData = never, TError = never> =
  | {
      success: true;
      data: TData;
    }
  | {
      success: false;
      error: TError;
    };

// ---cut---
type GetSuccessData<T> =
  T extends Result<infer Data> ? Data : never;

type Success = Result<string>;

type StringResult = GetSuccessData<Success>;
//   ^?

type Example =
  Extract<Success, { success: false }> extends Result<
    infer Data
  >
    ? Data
    : never;
