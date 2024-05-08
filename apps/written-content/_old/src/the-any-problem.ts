export const groupBy = <
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

const result = groupBy(
  [
    { age: 20, name: "Matt" },
    {
      age: 30,
      name: "Waqas",
    },
  ],
  "age"
);

result[20].forEach((item) => {
  //                ^?
});
