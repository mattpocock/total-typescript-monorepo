// This is without any actual annotations
// of the return type. This is a new feature
// in TS 5.5, and I freaking love it.
const isArrayOfStrings = (value: unknown) => {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
};

const myFunc = (value: unknown) => {
  if (isArrayOfStrings(value)) {
    console.log(value);
    //          ^?
  }
};
