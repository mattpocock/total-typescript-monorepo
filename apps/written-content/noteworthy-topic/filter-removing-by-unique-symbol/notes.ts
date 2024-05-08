// Create a unique symbol which represents the removal
// of an element
const REMOVE = Symbol();

declare const filter: <T, U>(
  array: T[],
  filter: (elem: T, index: number, array: T[]) => U
) => Exclude<U, typeof REMOVE>[];

const ids = [1, 2, 3, "abc", null, undefined];

const nullsRemoved = filter(ids, (id) => {
  return typeof id === "string" || typeof id === "number"
    ? id
    : REMOVE; // Return the symbol to remove the element
});

// It works on the type level too!
console.log(nullsRemoved);
//          ^?
