import {
  BaseAsync,
  type ErrAsync,
  type OkAsync,
  type ResultAsync,
} from "./result-async.js";
import type { Err, Ok, Result } from "./result.js";

type AnyGeneratorResult = IteratorResult<
  Err<any, any> | Ok<any, any>,
  Ok<any, any>
>;

export function safeTry<T = never, E = never>(
  generator: () => Generator<Result<T, E>, Ok<T, never>, void>,
): Result<T, E>;
export function safeTry<T, E>(
  generator: () => AsyncGenerator<ErrAsync<T, E>, OkAsync<T, E>, void>,
): ResultAsync<T, E>;
export function safeTry(
  generator: () =>
    | Generator<Result<any, any>, Ok<any, any>, void>
    | AsyncGenerator<ErrAsync<any, any>, OkAsync<any, any>, void>,
): Result<any, any> | ResultAsync<any, any> {
  const iterator = generator();

  const result = iterator.next();

  if (result instanceof Promise) {
    return new BaseAsync(result.then((r) => r.value)) as any as ResultAsync<
      any,
      any
    >;
  }
  return result.value;
}
