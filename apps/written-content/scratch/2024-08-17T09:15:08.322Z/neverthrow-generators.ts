import { Err, err, Ok, ok, safeTry } from "neverthrow";

declare const errorGenerator: Generator<
  Err<never, string>,
  never,
  unknown
>;

declare const okGenerator: Generator<
  Err<never, never>,
  number,
  unknown
>;

safeTry(async function* () {
  const example = yield* errorGenerator;

  const example2 = yield* okGenerator;

  return ok(1);
});
