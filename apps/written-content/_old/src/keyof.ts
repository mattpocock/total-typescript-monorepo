export type Event =
  | {
      type: "click";
      x: number;
      y: number;
    }
  | {
      type: "hover";
      element: HTMLElement;
    };

type EventMap = {
  [E in Event]: (event: E) => void;
};

type SuccessResponseCode = 200;

type ErrorResponseCode = 400 | 500;

type ResponseCode =
  | SuccessResponseCode
  | ErrorResponseCode;

type ResponseShape = {
  [C in ResponseCode]: {
    code: C;
    body: C extends SuccessResponseCode
      ? { success: true }
      : { success: false; error: string };
  };
}[ResponseCode];

const urlSearchParams = new URLSearchParams(
  window.location.search
);
const params = Object.fromEntries(
  urlSearchParams.entries()
);
