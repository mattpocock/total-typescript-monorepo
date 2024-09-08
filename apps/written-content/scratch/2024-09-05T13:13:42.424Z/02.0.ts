// Negated types

type AnyStringExceptClick = string;

const addGlobalHandler = <T extends string>(event: T) => {
  // ...implementation
};

addGlobalHandler("awdjhbawdjawdbh"); // How do we make this error?
