const example1: {} = "str";
const example2: {} = 123;
const example3: {} = true;
const example4: {} = {
  foo: "whatever",
};

const example5: {} = null;
const example6: {} = undefined;

// ----------------------------

const obj1: Object = "str";
const obj2: Object = null;

// ----------------------------

type EmptyObj = Record<string, never>;

const emptyObj1: EmptyObj = {};
const emptyObj2: EmptyObj = {
  foo: "whatever",
};
const emptyObj3: EmptyObj = "str";
const emptyObj4: EmptyObj = 123;

// ----------------------------

const myFunc = (constraint: {}) => {};

myFunc("str");
myFunc(123);
myFunc(true);

// ----------------------------

const myGenericFunc = <T extends {}>(t: T) => {
  return t;
};

const result1 = myGenericFunc("str");
const result2 = myGenericFunc(123);
const result3 = myGenericFunc(true);

const result4 = myGenericFunc(null);
const result5 = myGenericFunc(undefined);
