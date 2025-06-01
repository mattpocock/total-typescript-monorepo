import { AbsoluteFill } from "remotion";

export const MyComposition = ({ text }: { text: string }) => {
  return (
    <AbsoluteFill className="flex items-center justify-center">
      <Subtitle text={text} />
    </AbsoluteFill>
  );
};

const Subtitle = ({ text }: { text: string }) => {
  return (
    <div className="text-blue-200 text-5xl mx-12 text-center leading-20 font-semibold bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 px-12 shadow-xl">
      <p className="">{text}</p>
    </div>
  );
};
