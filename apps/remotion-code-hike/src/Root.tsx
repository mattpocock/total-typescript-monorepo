import { Composition } from "remotion";
import { Main } from "./Main";
import "./tailwind.css";
import { calculateMetadata } from "./calculate-metadata";
import { meta } from "./meta";

export const RemotionRoot = () => {
  return (
    // @ts-ignore
    <Composition
      id="CodeHikeExample"
      component={Main}
      width={meta.width || 1920}
      height={meta.height || 1080}
      calculateMetadata={calculateMetadata}
    />
  );
};
