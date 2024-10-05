import { useEffect, useRef } from "react";

export const useForceSquareAspectRatio = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;

    if (!outer || !inner) return;

    const innerRect = inner.getBoundingClientRect();

    if (innerRect.height > innerRect.width) {
      outer.style.height = `${innerRect.height}px`;
    } else {
      outer.style.width = `${innerRect.width}px`;
    }
  });

  return { outerRef, innerRef };
};
