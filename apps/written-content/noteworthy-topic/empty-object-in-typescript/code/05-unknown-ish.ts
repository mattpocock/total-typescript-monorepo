// How would I type unknownish?
type Unknownish = {}

const logData = (data: Unknownish) => {
  if ("foo" in data && typeof data.foo === "string") {
    console.log(data.foo);
  }
};
