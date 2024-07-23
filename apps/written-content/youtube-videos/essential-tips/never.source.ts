const myFunc = (id: string | number) => {
  if (typeof id !== "string") {
    console.log(id);
    //          ^?
  }
};
