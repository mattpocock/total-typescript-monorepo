import { err, ok, safeTry, Result } from "neverthrow";

declare const jsonParse: (
  input: string,
) => Result<{ id: number }, "syntax-error">;
declare const getLocalStorage: () => Result<
  Storage,
  "dom-exception"
>;

// ---cut---
const resultOfSafeTry = safeTry(function* () {
  const { id } =
    yield* jsonParse("{ id: 123 }").safeUnwrap();

  console.log(id);
  //          ^?

  const storage = yield* getLocalStorage().safeUnwrap();

  console.log(storage);
  //          ^?

  return ok({ id, storage });
});

console.log(resultOfSafeTry);
//          ^?
