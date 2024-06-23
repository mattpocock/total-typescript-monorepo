export const calculateElemScale = (opts: {
  targetWidth: number;
  targetHeight: number;
  elemWidth: number;
  elemHeight: number;
}): number => {
  const widthScale = opts.targetWidth / opts.elemWidth;
  const heightScale =
    opts.targetHeight / opts.elemHeight;
  return Math.min(widthScale, heightScale);
};
