// How would we make this error correctly?

const receivesEmpty = (empty: {}) => {};

// Should error:
receivesEmpty("str");

// Should error:
receivesEmpty({ foo: true });

// Shouldn't error:
receivesEmpty({});
