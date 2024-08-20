import { err, ok, safeTry } from "neverthrow";

const mightError = safeTry(function* () {
  if (Math.random() > 0.5) {
    yield* err(new Error("Oh dear")).safeUnwrap();
  }

  return ok({ id: 1 });
});

console.log(mightError);
//          ^?

const wontError = safeTry(function* () {
  return ok({ id: 1 });
});

console.log(wontError);
//          ^?
