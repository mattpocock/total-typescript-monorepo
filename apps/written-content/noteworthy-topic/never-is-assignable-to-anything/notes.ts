const raise = () => {
  throw new Error("Oh dear");
};

const neverAssigned = raise();

console.log(neverAssigned);
//          ^?

const myString: string = neverAssigned;
const myBoolean: boolean = neverAssigned;
