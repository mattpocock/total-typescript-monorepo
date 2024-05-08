const goToPoint = (point: Point) => {};

declare const getCurrentPoint: () => Point;

type Point = {
  x: number;
  y: number;
};

const myPoint = getCurrentPoint();
