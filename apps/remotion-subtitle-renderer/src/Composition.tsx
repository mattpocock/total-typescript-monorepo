import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

export const MyComposition = ({
  subtitles,
  cta,
  ctaDurationInFrames,
}: {
  subtitles: { startFrame: number; endFrame: number; text: string }[];
  ctaDurationInFrames: number;
  cta: "ai" | "typescript";
  durationInFrames: number;
}) => {
  return (
    <>
      {/* <OffthreadVideo src={staticFile("/input.mp4")} /> */}
      {subtitles.map((subtitle, index, arr) => (
        <Sequence
          from={subtitle.startFrame - 2}
          durationInFrames={
            index === arr.length - 1
              ? Infinity
              : subtitle.endFrame - subtitle.startFrame
          }
        >
          <AbsoluteFill className="flex items-center justify-center">
            <Subtitle text={subtitle.text} isFirst={index === 0} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Sequence durationInFrames={ctaDurationInFrames}>
        <AbsoluteFill className="flex flex-col">
          <CTAPill cta={cta} durationInFrames={ctaDurationInFrames} />
        </AbsoluteFill>
      </Sequence>
    </>
  );
};

const FADE_DURATION = 8;
const MOVE_DISTANCE = 30;
const FADE_OUT_BUFFER_BEFORE_END = 4;

const CTAPill = ({
  cta,
  durationInFrames,
}: {
  cta: "ai" | "typescript";
  durationInFrames: number;
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [
      0,
      FADE_DURATION,
      durationInFrames - FADE_DURATION - FADE_OUT_BUFFER_BEFORE_END,
      durationInFrames - FADE_OUT_BUFFER_BEFORE_END,
    ],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Move up from 0px to -10px over the animation
  const translateY = interpolate(
    frame,
    [0, durationInFrames - FADE_OUT_BUFFER_BEFORE_END],
    [0, -MOVE_DISTANCE],
    {},
  );

  return (
    <>
      <div className="flex-1"></div>
      <div className="flex flex-1 items-center justify-center">
        {cta === "ai" ? (
          <div className="w-full h-full flex items-center justify-center px-24">
            <Img
              src={staticFile("/ai-cta.png")}
              className="w-full h-full object-contain"
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center px-6">
            <Img
              src={staticFile("/typescript-cta.png")}
              className="w-full h-full object-contain"
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

const ANIMATION_DURATION = 8;
const BASE_Y_TRANSFORM = 64;

const Subtitle = ({ text, isFirst }: { text: string; isFirst: boolean }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, ANIMATION_DURATION],
    [
      // If it's the first subtitle, no animation
      isFirst ? 1 : 0.5,
      1,
    ],
    {
      extrapolateRight: "clamp",
    },
  );

  const y = interpolate(
    frame,
    [0, ANIMATION_DURATION],
    [
      // If it's the first subtitle, no animation
      isFirst ? 0 : 20,
      0,
    ],
    {
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
  );

  return (
    <div
      className="mx-12 font-semibold p-6"
      style={{
        opacity,
        transform: `translateY(${y + BASE_Y_TRANSFORM}px)`,
      }}
    >
      <p className="text-amber-200 leading-20 text-5xl text-balance text-center inline-block">
        {text.split(" ").map((word, index) => (
          <span key={index} className={`relative inline-block mx-3`}>
            <div className="absolute -top-2 -left-8 -right-8 -bottom-2 bg-stone-900" />
            <span className="relative z-10">{word}</span>
          </span>
        ))}
      </p>
    </div>
  );
};
