import { objToStringify } from "./obj-to-stringify.js";
import fastJson from "fast-json-stringify";

const stringify = fastJson({
  type: "object",
  properties: {
    a: {
      type: "object",
      properties: {
        b: {
          type: "object",
          properties: {
            c: {
              type: "object",
              properties: {
                d: {
                  type: "object",
                  properties: {
                    e: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

for (let i = 0; i < 1000; i++) {
  stringify(objToStringify);
}
