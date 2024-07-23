// @errors: 2561
type FetchOptions = {
  url: string;
  timeout?: number;
};

const myFetch = async (
  opts: FetchOptions,
) => {
  // ...
};

// Or, passing it directly
// to the function:
myFetch({
  url: "/user.json",
  timeOut: 5000,
});
