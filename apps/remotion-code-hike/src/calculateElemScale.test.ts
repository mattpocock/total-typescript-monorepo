import { expect, it } from "vitest";
import { calculateElemScale } from "./calculateElemScale";

it("Should work", () => {
  expect(
    calculateElemScale({
      targetHeight: 1000,
      targetWidth: 1000,
      elemHeight: 500,
      elemWidth: 500,
    }),
  ).toEqual(2);

  expect(
    calculateElemScale({
      targetHeight: 1000,
      targetWidth: 500,
      elemHeight: 500,
      elemWidth: 500,
    }),
  ).toEqual(1);

  expect(
    calculateElemScale({
      targetHeight: 500,
      targetWidth: 1000,
      elemHeight: 500,
      elemWidth: 500,
    }),
  ).toEqual(1);

  expect(
    calculateElemScale({
      targetHeight: 1000,
      targetWidth: 1000,
      elemHeight: 500,
      elemWidth: 250,
    }),
  ).toEqual(2);

  expect(
    calculateElemScale({
      targetHeight: 1000,
      targetWidth: 1000,
      elemHeight: 250,
      elemWidth: 500,
    }),
  ).toEqual(2);
});
