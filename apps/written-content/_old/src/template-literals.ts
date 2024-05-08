// Template literals

// Example 1

type Url<Endpoint extends string> =
  `https://example.com/api/${Endpoint}`;

type Result1 = Url<"users">; // "https://example.com/api/users"

// Example 2

type Pluralize<T extends string> = `${T}s`;

type Result2 = Pluralize<"apple">; // "apples"

// Example 3:

type PathCombine<
  Prefix extends string,
  Suffix extends string
> = `${Prefix}/${Suffix}`;

type Result = PathCombine<
  "https://example.com/api",
  "users"
>; // "https://example.com/api/users"

// Example 4:

type ReverseString<T extends string> =
  T extends `${infer U}${infer R}`
    ? `${ReverseString<R>}${U}`
    : T;

type Result4 = ReverseString<"Hello World">; // "dlroW olleH"
