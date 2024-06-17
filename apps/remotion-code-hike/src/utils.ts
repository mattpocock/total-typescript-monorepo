import { TokenTransition } from "codehike/utils/token-transitions";
import {
  interpolate,
  interpolateColors,
} from "remotion";
import { DATA_NO_OVERRIDE_ATTRIBUTE } from "./constants";

export function applyStyle({
  element,
  keyframes,
  progress,
}: {
  element: HTMLElement;
  keyframes: TokenTransition["keyframes"];
  progress: number;
}) {
  const { translateX, translateY, color, opacity } =
    keyframes;

  if (
    element.getAttribute(
      DATA_NO_OVERRIDE_ATTRIBUTE,
    ) === "false"
  ) {
    return;
  }

  if (opacity) {
    element.style.opacity = interpolate(
      progress,
      [0, 1],
      opacity,
    ).toString();
  }
  if (color) {
    element.style.color = interpolateColors(
      progress,
      [0, 1],
      color,
    );
  }
  const x = translateX
    ? interpolate(progress, [0, 1], translateX)
    : 0;
  const y = translateY
    ? interpolate(progress, [0, 1], translateY)
    : 0;
  element.style.translate = `${x}px ${y}px`;
}
