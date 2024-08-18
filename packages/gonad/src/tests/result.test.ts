import { expect, expectTypeOf, it } from "vitest";
import { err, ok, safeTry, type Result } from "../result.js";

it("Should return ok from a simple function", () => {
  const result = safeTry(function* () {
    return ok(1);
  });

  expect(result.isOk()).toBe(true);

  if (!result.isOk()) return;

  expect(result.value).toBe(1);
});

it("Should be able to yield* err", () => {
  const result = safeTry(function* () {
    yield* err("Error");

    return ok(1);
  });

  expect(result.isOk()).toBe(false);

  if (!result.isErr()) return;

  expect(result.error).toBe("Error");
});

it("Should be able to yield* ok", () => {
  let output: number = 0;
  safeTry(function* () {
    const result = yield* ok(200);

    output = result;

    return ok(1);
  });

  expect(output).toEqual(200);
});

it("Should be able to yield* an unknown result", () => {
  const mightReturnErr = (): Result<number, "Error"> => {
    if (0 > 1) {
      // Will never actually error, but shows
      // up in the types
      return err("Error");
    }

    return ok(1);
  };

  const result = safeTry(function* () {
    const result = yield* mightReturnErr();

    return ok(result);
  });

  expect(result.isOk()).toBe(true);

  if (!result.isOk()) return;

  expect(result.value).toBe(1);
});

it("Should be able to safeTry a safeTry", () => {
  const result = safeTry(function* () {
    const innerResult = yield* safeTry(function* () {
      return ok(1);
    });

    return ok(innerResult);
  });

  expect(result.isOk()).toBe(true);

  if (!result.isOk()) return;

  expect(result.value).toBe(1);
});

it("Should be able to mapErr on an error", () => {
  const result = err("error").mapError((error) => error.toUpperCase());

  expect(result.isErr()).toBe(true);

  expectTypeOf(result).toEqualTypeOf<Result<never, string>>();

  if (!result.isErr()) return;

  expect(result.error).toBe("ERROR");
});

it("Should be able to mapErr on an ok", () => {
  const result = ok(1).mapError((error) => {
    return "error";
  });

  expect(result.isOk()).toBe(true);

  expectTypeOf(result).toEqualTypeOf<Result<number, "error">>();

  if (!result.isOk()) return;

  expect(result.value).toBe(1);
});

it("Should be able to map on an ok", () => {
  const result = ok(1).map((value) => value + 1);

  expect(result.isOk()).toBe(true);

  expectTypeOf(result).toEqualTypeOf<Result<number, never>>();

  if (!result.isOk()) return;

  expect(result.value).toBe(2);
});

it("Should be able to map on an error", () => {
  const result = err("error").map((value) => value + 1);

  expect(result.isErr()).toBe(true);

  expectTypeOf(result).toEqualTypeOf<Result<number, "error">>();

  if (!result.isErr()) return;

  expect(result.error).toBe("error");
});

it("Should be able to .andThen on an ok", () => {
  const result = ok(1).andThen((value) => ok(value + 1));

  expect(result.isOk()).toBe(true);

  expectTypeOf(result).toEqualTypeOf<Result<number, never>>();

  if (!result.isOk()) return;

  expect(result.value).toBe(2);
});

it("Should be able to .andThen on an error", () => {
  const result = err("error").andThen((value) => ok(value + 1));

  expect(result.isErr()).toBe(true);

  expectTypeOf(result).toEqualTypeOf<Result<number, "error">>();

  if (!result.isErr()) return;

  expect(result.error).toBe("error");
});
