// http://localhost:3004/courses/exercises/685abeb8-6b46-40bb-adc4-e1da7018a050/edit

const handleRequest = (requestBody: { input: any }) => {
  const rawBytes = new Buffer(requestBody.input);
  const encoded = rawBytes.toString("base64");

  return encoded;
};

// 1. Can exploit this by sending a large number, draining
// the service of memory and slowing/crashing it
handleRequest({ input: 5000000 });

// 2. Because we're using Buffer.allocUnsafe under the hood,
// the memory allocated could contain sensitive data
const maybeSensitiveData = handleRequest({ input: 5000000 });
