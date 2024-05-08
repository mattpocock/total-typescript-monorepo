type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// ---cut---

type CanvasEvent =
  | {
      type: "click";
      clickedItemId?: string;
      location: [number, number];
    }
  | {
      type: "mousemove";
      location: [number, number];
    };

type AsObject = {
  [T in CanvasEvent as T["type"]]: Prettify<
    Omit<T, "type">
  >;
};

type Example = AsObject;
//   ^?
