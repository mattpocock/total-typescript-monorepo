type SomeObject = {
  a: string;
  b: number;
};

// IIMT

export type Example = {
  [K in keyof SomeObject]: {
    key: K;
  };
}[keyof SomeObject];
