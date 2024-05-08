type SomeObject = {
  a: string;
  b: number;
};

export type Example = {
  [K in keyof SomeObject]: {
    key: K;
  };
}[keyof SomeObject];

type Event =
  | {
      type: "click";
      x: number;
      y: number;
    }
  | {
      type: "hover";
      element: HTMLElement;
    };
type Example2 = {
  [E in Event]: {};
};
