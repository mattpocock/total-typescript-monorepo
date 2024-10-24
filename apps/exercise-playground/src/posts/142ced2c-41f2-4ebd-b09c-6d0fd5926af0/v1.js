import { objToStringify } from "./obj-to-stringify.js";

for (let i = 0; i < 1000; i++) {
  JSON.stringify(objToStringify);
}
