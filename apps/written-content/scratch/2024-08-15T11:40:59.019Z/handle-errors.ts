type AnyInstance = abstract new (...args: any) => any;

const handleErrors = <
  TResult,
  TError extends AnyInstance,
  TNewResult,
>(
  result: TResult,
  errors: TError | TError[],
  handle: (error: InstanceType<TError>) => TNewResult,
):
  | Exclude<TResult, InstanceType<TError>>
  | TNewResult => {};

class TooHighError extends Error {
  override message = "Input too high";
}

const yesIndeed = () => {};

const fantastic = () => {};

function createNumber() {
  const num = Math.random();
  if (num > 0.5) {
    // 2. Return the error instead of throwing it
    return new TooHighError();
  }

  return num;
}

const result = handleErrors(
  createNumber(),
  TooHighError,
  (err) => {
    throw err;
  },
);
