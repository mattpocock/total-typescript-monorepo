// How on earth do you type this function?

const groupBy2 = <
  TObj extends Record<string, unknown>,
  TKey extends keyof TObj
>(
  arr: TObj[],
  key: TKey
) => {
  const result = {} as Record<
    TObj[TKey] & PropertyKey,
    TObj[]
  >;
  arr.forEach((item) => {
    const resolvedKey = item[key] as TObj[TKey] &
      PropertyKey;
    if (result[resolvedKey]) {
      result[resolvedKey].push(item);
    } else {
      result[resolvedKey] = [item];
    }
  });
  return result;
};

// Example:

const array = [
  { name: "John", age: 20 },
  { name: "Jane", age: 20 },
  { name: "Jack", age: 30 },
];

const groupBy = (arr: any[], key: any) => {
  const result: any = {};
  arr.forEach((item) => {
    // How do we know that item is an object?
    // Or that it has a property the same
    // as the key we pass in?
    const resultKey = item[key];

    if (result[resultKey]) {
      result[resultKey].push(item);
    } else {
      result[resultKey] = [item];
    }
  });

  return result;
};

const result = groupBy(array);

result[20].foreach((item) => {
  // item is any!
  console.log(item.name, item.age);
});

type Yeah<T1, T2> = {};

export type Example = Yeah<1, 2>;

<div awdawdawd="123123" />;
