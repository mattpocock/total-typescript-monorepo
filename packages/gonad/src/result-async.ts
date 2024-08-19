import type { Result } from "./result.js";

export interface IBaseAsync<T = never, E = never> {
  [Symbol.iterator]: () => AsyncGenerator<Result<T, E>, T, void>;
  mapError<F extends string = never>(fn: (error: E) => F): ResultAsync<T, F>;
  mapError<F = never>(fn: (error: E) => F): ResultAsync<T, F>;
  map: <F = never>(fn: (value: T) => F) => ResultAsync<F, E>;
  andThen: <F = never>(
    fn: (value: T) => ResultAsync<F, E>,
  ) => ResultAsync<F, E>;
  orElse: <F = never>(fn: (error: E) => ResultAsync<T, F>) => ResultAsync<T, F>;
}

export interface OkAsync<T, E> extends IBaseAsync<T, never> {
  type: "ok";
  value: T;
}

export interface ErrAsync<T, E> extends IBaseAsync<never, E> {
  type: "err";
  error: E;
}

export type ResultAsync<T = never, E = never> = OkAsync<T, E> | ErrAsync<T, E>;

export class BaseAsync<T = never, E = never> implements IBaseAsync<T, E> {
  #promise: Promise<Result<T, E>>;
  constructor(input: Promise<Result<T, E>>) {
    this.#promise = input;
  }

  [Symbol.iterator](): AsyncGenerator<Result<T, E>, T> {
    const self = this;
    return (async function* () {
      yield* await self.#promise.then((r) => r[Symbol.iterator]());
    })();
  }

  mapError<F = never>(fn: (error: E) => F): ResultAsync<T, F> {
    if (this.type === "ok") {
      return this as any as OkAsync<T, E>;
    }

    return errAsync(fn(this.error));
  }

  map<F = never>(fn: (value: T) => F): ResultAsync<F, E> {
    if (this.type === "err") {
      return this as any as ErrAsync<T, E>;
    }

    return ok(fn(this.value));
  }

  andThen<F = never>(fn: (value: T) => ResultAsync<F, E>): ResultAsync<F, E> {
    if (this.type === "err") {
      return this as any as ErrAsync<T, E>;
    }

    return fn(this.value);
  }

  orElse<F = never>(fn: (error: E) => ResultAsync<T, F>): ResultAsync<T, F> {
    if (this.type === "ok") {
      return this as any as OkAsync<T, E>;
    }

    return fn(this.error);
  }
}

export function errAsync<E extends string>(error: E): ErrAsync<never, E>;
export function errAsync<E>(error: E): ErrAsync<never, E>;
export function errAsync<E>(error: E) {
  return new BaseAsync({ type: "err", error }) as ErrAsync<never, E>;
}
export const okAsync = <T>(value: T): OkAsync<T, never> =>
  new BaseAsync({ type: "ok", value }) as OkAsync<T, never>;
