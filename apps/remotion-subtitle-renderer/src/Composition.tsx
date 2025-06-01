import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";

export const MyComposition = ({
  subtitles,
}: {
  subtitles: { startFrame: number; endFrame: number; text: string }[];
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
            <Subtitle text={subtitle.text} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </>
  );
};

const ANIMATION_DURATION = 8;
const BASE_Y_TRANSFORM = 64;

const Subtitle = ({ text }: { text: string }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, ANIMATION_DURATION], [0.5, 1], {
    extrapolateRight: "clamp",
  });

  const y = interpolate(frame, [0, ANIMATION_DURATION], [20, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

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
