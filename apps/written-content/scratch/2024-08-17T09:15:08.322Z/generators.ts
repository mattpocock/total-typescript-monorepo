interface Base<T, E> {
  [Symbol.iterator]: () => Generator<Err<E>, T, void>;
  mapErr: <U>(fn: (error: E) => U) => Result<T, U>;
}

interface Ok<T> extends Base<T, never> {
  type: "ok";
  value: T;
}

interface Err<E> extends Base<never, E> {
  type: "err";
  error: E;
}

type Result<T, E> = Ok<T> | Err<E>;

declare const err: <E>(error: E) => Err<E>;

type Example = Generator<
  Result<number, string>,
  void,
  void
>;

declare const safeTry: {
  <T, E>(
    generator: () => Generator<Err<E>, Ok<T>, void>,
  ): Result<T, E>;
  <T, E>(
    generator: () => AsyncGenerator<Err<E>, Ok<T>, void>,
  ): Promise<Result<T, E>>;
};

declare const possibleError: Result<string, Error>;

safeTry(function* () {
  const wow = yield* ok(1);

  const result = yield* possibleError;

  return ok(wow);
}).mapErr((err) => {
  console.error(err);
});
