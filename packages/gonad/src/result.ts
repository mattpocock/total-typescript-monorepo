export interface IBase<T = never, E = never> {
  [Symbol.iterator]: () => Generator<Result<T, E>, T, void>;
  isOk: () => this is Ok<T, E>;
  isErr: () => this is Err<T, E>;
  mapError<F extends string = never>(fn: (error: E) => F): Result<T, F>;
  mapError<F = never>(fn: (error: E) => F): Result<T, F>;
  map: <F = never>(fn: (value: T) => F) => Result<F, E>;
  andThen: <F = never>(fn: (value: T) => Result<F, E>) => Result<F, E>;
  orElse: <F = never>(fn: (error: E) => Result<T, F>) => Result<T, F>;
}

export interface Ok<T, E> extends IBase<T, never> {
  type: "ok";
  value: T;
}

export interface Err<T, E> extends IBase<never, E> {
  type: "err";
  error: E;
}

export type Result<T = never, E = never> = Ok<T, E> | Err<T, E>;

export class Base<T = never, E = never> implements IBase<T, E> {
  #value!: T;
  #error!: E;
  type: "ok" | "err";
  constructor(input: { type: "ok"; value: T } | { type: "err"; error: E }) {
    if (input.type === "ok") {
      this.#value = input.value;
    } else {
      this.#error = input.error;
    }

    this.type = input.type;
  }

  get value(): T {
    if (this.type === "ok") {
      return this.#value;
    }

    throw new Error("Value is not available on Err");
  }

  get error(): E {
    if (this.type === "err") {
      return this.#error;
    }

    throw new Error("Error is not available on Ok");
  }

  isOk(): this is Ok<T, E> {
    return this.type === "ok";
  }

  isErr(): this is Err<T, E> {
    return this.type === "err";
  }

  [Symbol.iterator](): Generator<Result<T, E>, T> {
    const self = this;
    return (function* () {
      if (self.type === "ok") {
        return self.value;
      }

      yield self;

      throw new Error("This should never be reached");
    })() as any;
  }

  mapError<F = never>(fn: (error: E) => F): Result<T, F> {
    if (this.type === "ok") {
      return this as any as Ok<T, E>;
    }

    return err(fn(this.error));
  }

  map<F = never>(fn: (value: T) => F): Result<F, E> {
    if (this.type === "err") {
      return this as any as Err<T, E>;
    }

    return ok(fn(this.value));
  }

  andThen<F = never>(fn: (value: T) => Result<F, E>): Result<F, E> {
    if (this.type === "err") {
      return this as any as Err<T, E>;
    }

    return fn(this.value);
  }

  orElse<F = never>(fn: (error: E) => Result<T, F>): Result<T, F> {
    if (this.type === "ok") {
      return this as any as Ok<T, E>;
    }

    return fn(this.error);
  }
}

export function err<E extends string>(error: E): Err<never, E>;
export function err<E>(error: E): Err<never, E>;
export function err<E>(error: E) {
  return new Base({ type: "err", error }) as Err<never, E>;
}
export const ok = <T>(value: T): Ok<T, never> =>
  new Base({ type: "ok", value }) as Ok<T, never>;

export function safeTry<T = never, E = never>(
  generator: () => Generator<Result<T, E>, Ok<T, never>, void>,
): Result<T, E>;
// export function safeTry<T, E>(
//   generator: () => AsyncGenerator<Err<T, E>, Ok<T>, void>,
// ): Promise<Result<T, E>>;
export function safeTry(
  generator: () => Generator<Result<any, any>, Ok<any, any>, void>,
): Result<any, any> {
  const iterator = generator();

  let result: IteratorResult<Err<any, any> | Ok<any, any>, Ok<any, any>>;

  while (true) {
    result = iterator.next();

    if (result.done) {
      return result.value;
    }

    if (result.value.isErr()) {
      return result.value;
    }
  }
}
