Here's a list of ways you can combine keyof with generic functions (with examples in markdown) to make powerful abstractions:

- **Omitting Keys from an Object** - This function can be used to omit certain keys from an object. It takes two arguments, `obj` of type `T` and `keys` of type `keyof T`. The function returns a new object without the specified keys.

  ```typescript
  function omit<
    T extends object,
    K extends keyof T
  >(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj } as Omit<T, K>;
    keys.forEach((key) => delete result[key]);
    return result;
  }

  const user = {
    firstName: "John",
    lastName: "Doe",
    age: 30,
  };

  const userWithoutAge = omit(user, ["age"]); // { firstName: "John", lastName: "Doe" }
  ```

- **Filtering an Object by Keys and Values** - This function can be used to filter an object by the keys and values that match certain criteria. It takes three arguments, `obj` of type `T`, `keyFilter` of type `(key: keyof T) => boolean`, and `valueFilter` of type `(value: T[keyof T]) => boolean`. The function returns a new object with only the keys and values that match both filters.

  ```typescript
  function filterKeysValues<T extends object>(
    obj: T,
    keyFilter: (key: keyof T) => boolean,
    valueFilter: (value: T[keyof T]) => boolean
  ): Partial<T> {
    return Object.keys(obj).reduce((acc, key) => {
      const typedKey = key as keyof T;
      const value = obj[typedKey];

      if (
        keyFilter(typedKey) &&
        valueFilter(value)
      ) {
        return { ...acc, [typedKey]: value };
      }

      return acc;
    }, {});
  }
  ```
