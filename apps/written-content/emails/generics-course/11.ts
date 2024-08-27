const camelCaseKeys = <T extends object>(obj: T): T => {
  const newObj = {} as T;

  for (const key in obj) {
    (newObj as any)[
      key.replace(/-([a-z])/g, (g) => g[1]!.toUpperCase())
    ] = obj[key];
  }

  return newObj;
};
