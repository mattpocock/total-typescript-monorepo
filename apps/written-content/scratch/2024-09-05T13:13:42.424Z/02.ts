// Negated types

type AnyStringExceptClick = string;

const addGlobalHandler = (event: AnyStringExceptClick) => {
  // ...implementation
};

addGlobalHandler("click"); // How do we make this error?
