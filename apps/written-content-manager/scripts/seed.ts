import { seed } from "~/db/db";

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
