// http://localhost:3004/posts/9382af51-d12e-4e77-86ce-27d15900e290/edit

import { err, ok, safeTry } from "neverthrow";

const mightFail = () => {
  if (Math.random() > 0.5) {
    return ok("It worked!");
  }
  return err("It failed!");
};

safeTry(async function* () {
  const safeResult1 = yield* mightFail();
  const safeResult2 = yield* mightFail();
  const safeResult3 = yield* mightFail();
  const safeResult4 = yield* mightFail();
  const safeResult5 = yield* mightFail();

  return ok(safeResult5);
});
