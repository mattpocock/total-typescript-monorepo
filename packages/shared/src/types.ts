declare const brand: unique symbol;

export type Brand<T, Brand extends string> = T & { [brand]: Brand };

export type AbsolutePath = Brand<string, "AbsolutePath">;
export type RelativePath = Brand<string, "RelativePath">;
export type AnyPath = AbsolutePath | RelativePath;

export type EmptyObject = Record<string, never>;
