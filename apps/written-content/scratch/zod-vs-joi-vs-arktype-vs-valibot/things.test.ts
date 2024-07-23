import {
  ArkError,
  type,
} from "arktype";
import Joi from "joi";
import * as v from "valibot";
import {
  expect,
  it,
} from "vitest";
import { z } from "zod";

it("Zod should parse an object properly", () => {
  const schema = z.object({
    email: z.string().email(),
  });

  expect(
    schema.parse({
      email:
        "matt@example.com",
    }),
  ).toEqual({
    email: "matt@example.com",
  });

  expect(() =>
    schema.parse({
      email: "not-an-email",
    }),
  ).toThrow();
});

it("Valibot should parse an object properly", () => {
  const schema = v.object({
    email: v.pipe(
      v.string(),
      v.email(),
    ),
  });

  expect(
    v.parse(schema, {
      email:
        "matt@example.com",
    }),
  ).toEqual({
    email: "matt@example.com",
  });

  expect(() =>
    v.parse(schema, {
      email: "not-an-email",
    }),
  ).toThrow();
});

it("Arktype should parse an object properly", () => {
  const schema = type({
    email: "email",
  });

  expect(
    schema({
      email:
        "matt@example.com",
    }),
  ).toEqual({
    email: "matt@example.com",
  });

  const errors = schema({
    email: "not-an-email",
  }) as any;

  expect(errors).toHaveLength(
    1,
  );
  expect(
    errors[0],
  ).toBeInstanceOf(ArkError);
});

it("Joi should parse an object properly", () => {
  const schema = Joi.object({
    email:
      Joi.string().email(),
  });

  expect(
    schema.validate({
      email:
        "matt@example.com",
    }),
  ).toEqual({
    value: {
      email:
        "matt@example.com",
    },
  });

  expect(
    schema.validate({
      email: "not-an-email",
    }).error,
  ).toBeInstanceOf(
    Joi.ValidationError,
  );
});

// it("Typebox should parse an object properly", () => {
//   const schema = Type.Object({
//     email: Type.String({
//       format: "idn-email",
//     }),
//   });

//   const compiler =
//     TypeCompiler.Compile(
//       schema,
//     );

//   console.log(
//     compiler.Errors({
//       email:
//         "matt@example.com",
//     }),
//   );

//   expect(
//     compiler.Encode({
//       email:
//         "matt@example.com",
//     }),
//   ).toEqual({
//     email: "matt@example.com",
//   });
// });

// it("Ajv should parse an object properly", () => {
//   const ajv = new Ajv();

//   ajv.addFormat("email");

//   const schema = {
//     type: "object",
//     properties: {
//       email: {
//         type: "string",
//         format: "email",
//       },
//     },
//     required: ["email"],
//   };

//   const validate =
//     ajv.compile(schema);

//   expect(
//     validate({
//       email:
//         "matt@example.com",
//     }),
//   ).toBe(true);

//   expect(
//     validate({
//       email: "not-an-email",
//     }),
//   ).toBe(false);
// });
