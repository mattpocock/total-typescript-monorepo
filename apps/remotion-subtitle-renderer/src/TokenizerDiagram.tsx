import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Simple tokenizer vocabulary
const vocabulary = {
  Hello: 1,
  world: 2,
  how: 3,
  are: 4,
  you: 5,
  today: 6,
  "?": 7,
  "!": 8,
  ".": 9,
  ",": 10,
};

// Reverse vocabulary for decoding
const reverseVocabulary = Object.fromEntries(
  Object.entries(vocabulary).map(([word, id]) => [id, word]),
);

export const TokenizerDiagram = ({
  text,
  tokensPerSecond,
  durationInFrames,
}: {
  text: string;
  tokensPerSecond: number;
  durationInFrames: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tokenize the input text
  const words = text
    .split(/(\s+|[.,!?;:])/)
    .filter((token) => token.trim().length > 0);
  const tokens = words.map((word) => (vocabulary as any)[word] || 0);

  // Calculate animation progress
  const tokensPerFrame = tokensPerSecond / fps;
  const currentStep = Math.min(
    Math.floor(frame * tokensPerFrame),
    words.length * 3, // 3 steps: word -> token -> word
  );

  const currentWordIndex = Math.floor(currentStep / 3);
  const currentPhase = currentStep % 3; // 0: word, 1: token, 2: decoded word

  return (
    <AbsoluteFill className="bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <div className="flex items-center justify-center h-full px-12">
        <div className="w-full max-w-4xl">
          {/* Main diagram area */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 mb-16">
            <div className="flex flex-col items-center space-y-12">
              {/* Words section */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`text-2xl font-semibold tracking-wide transition-colors duration-300 ${
                    currentPhase === 0 ? "text-white/90" : "text-white/40"
                  }`}
                >
                  Input
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  {words.map((word, index) => {
                    const isVisible = index <= currentWordIndex;
                    const isCurrent =
                      index === currentWordIndex && currentPhase === 0;

                    return (
                      <WordBox
                        key={`word-${index}`}
                        word={word}
                        isVisible={isVisible}
                        isCurrent={isCurrent}
                        index={index}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Arrow pointing down */}
              <div className="flex justify-center">
                <div className="w-1 h-16 bg-gradient-to-b from-white/60 to-white/20 rounded-full" />
              </div>

              {/* Tokens section */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`text-2xl font-semibold tracking-wide transition-colors duration-300 ${
                    currentPhase === 1 ? "text-white/90" : "text-white/40"
                  }`}
                >
                  Token
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  {tokens.map((token, index) => {
                    const isVisible = index <= currentWordIndex;
                    const isCurrent =
                      index === currentWordIndex && currentPhase === 1;

                    return (
                      <TokenBox
                        key={`token-${index}`}
                        token={token}
                        isVisible={isVisible}
                        isCurrent={isCurrent}
                        index={index}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Arrow pointing down */}
              <div className="flex justify-center">
                <div className="w-1 h-16 bg-gradient-to-b from-white/60 to-white/20 rounded-full" />
              </div>

              {/* Decoded words section */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`text-2xl font-semibold tracking-wide transition-colors duration-300 ${
                    currentPhase === 2 ? "text-white/90" : "text-white/40"
                  }`}
                >
                  Output
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  {words.map((word, index) => {
                    const isVisible = index <= currentWordIndex;
                    const isCurrent =
                      index === currentWordIndex && currentPhase === 2;

                    return (
                      <DecodedBox
                        key={`decoded-${index}`}
                        word={word}
                        isVisible={isVisible}
                        isCurrent={isCurrent}
                        index={index}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Process indicators */}
          <div className="flex justify-center space-x-8">
            <ProcessStep
              label="Encode"
              isActive={currentPhase === 1}
              isCompleted={
                currentWordIndex > 0 ||
                (currentWordIndex === 0 && currentPhase > 1)
              }
            />
            <ProcessStep
              label="Decode"
              isActive={currentPhase === 2}
              isCompleted={
                currentWordIndex > 0 ||
                (currentWordIndex === 0 && currentPhase > 2)
              }
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const WordBox = ({
  word,
  isVisible,
  isCurrent,
  index,
}: {
  word: string;
  isVisible: boolean;
  isCurrent: boolean;
  index: number;
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [frame - 15, frame], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  if (!isVisible) {
    return null;
  }

  const getClasses = () => {
    const baseClasses =
      "px-8 py-6 rounded-xl font-medium text-4xl transition-all duration-500";

    if (isCurrent) {
      return `${baseClasses} bg-blue-500/30 text-blue-200 border border-blue-400/50 backdrop-blur-sm`;
    }

    return `${baseClasses} bg-white/5 text-white/40 border border-white/10 backdrop-blur-sm`;
  };

  return (
    <span className={getClasses()} style={{ transform: `scale(${scale})` }}>
      {word}
    </span>
  );
};

const TokenBox = ({
  token,
  isVisible,
  isCurrent,
  index,
}: {
  token: number;
  isVisible: boolean;
  isCurrent: boolean;
  index: number;
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [frame - 15, frame], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  if (!isVisible) {
    return null;
  }

  const getClasses = () => {
    const baseClasses =
      "px-8 py-6 rounded-xl font-medium text-4xl transition-all duration-500";

    if (isCurrent) {
      return `${baseClasses} bg-green-500/30 text-green-200 border border-green-400/50 backdrop-blur-sm`;
    }

    return `${baseClasses} bg-white/5 text-white/40 border border-white/10 backdrop-blur-sm`;
  };

  return (
    <span className={getClasses()} style={{ transform: `scale(${scale})` }}>
      {token}
    </span>
  );
};

const DecodedBox = ({
  word,
  isVisible,
  isCurrent,
  index,
}: {
  word: string;
  isVisible: boolean;
  isCurrent: boolean;
  index: number;
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [frame - 15, frame], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  if (!isVisible) {
    return null;
  }

  const getClasses = () => {
    const baseClasses =
      "px-8 py-6 rounded-xl font-medium text-4xl transition-all duration-500";

    if (isCurrent) {
      return `${baseClasses} bg-purple-500/30 text-purple-200 border border-purple-400/50 backdrop-blur-sm`;
    }

    return `${baseClasses} bg-white/5 text-white/40 border border-white/10 backdrop-blur-sm`;
  };

  return (
    <span className={getClasses()} style={{ transform: `scale(${scale})` }}>
      {word}
    </span>
  );
};

const ProcessStep = ({
  label,
  isActive,
  isCompleted,
}: {
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}) => {
  const getClasses = () => {
    const baseClasses =
      "px-8 py-4 rounded-lg font-medium text-2xl transition-all duration-300";

    if (isActive) {
      return `${baseClasses} bg-white text-black shadow-lg`;
    }

    if (isCompleted) {
      return `${baseClasses} bg-white/20 text-white border border-white/30`;
    }

    return `${baseClasses} bg-white/5 text-white/60 border border-white/10`;
  };

  return <div className={getClasses()}>{label}</div>;
};
