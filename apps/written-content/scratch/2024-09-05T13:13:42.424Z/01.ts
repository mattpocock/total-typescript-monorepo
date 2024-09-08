// Adding key constraint to Omit

// type StrictOmit<T, K extends keyof T> = Omit<T, K>;

// Fix this with Omit!
type Spread<T1, T2> = T2 & Omit<T1, keyof T2>;

type Example = Spread<
  { overwriteMe: string },
  { overwriteMe: number; dontOverwriteMe: boolean }
>;
