// http://localhost:3004/courses/exercises/685abeb8-6b46-40bb-adc4-e1da7018a050/edit

// Imagine that this requestBody is unchecked, and
// coming from an external source
const handleRequest = (requestBody: { input: any }) => {
  const rawBytes = new Buffer(requestBody.input);
  const encoded = rawBytes.toString("base64");

  // Imagine that this encoded response is sent back
  // directly to that external source without checking
  return encoded;
};
