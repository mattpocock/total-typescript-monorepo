import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Sample text to build vocabulary from
const sampleTexts = [
  "Hello world",
  "Hello there",
  "How are you",
  "World peace",
  "Hello friend",
];

// Initial empty vocabulary
const initialVocabulary: Record<string, number> = {};

export const VocabularyDiagram = ({
  tokensPerSecond,
  durationInFrames,
}: {
  tokensPerSecond: number;
  durationInFrames: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate animation progress
  const tokensPerFrame = tokensPerSecond / fps;
  const currentStep = Math.min(
    Math.floor(frame * tokensPerFrame),
    sampleTexts.length * 4, // 4 steps per text: show text -> tokenize -> add to vocab -> show vocab
  );

  const currentTextIndex = Math.floor(currentStep / 4);
  const currentPhase = currentStep % 4; // 0: show text, 1: tokenize, 2: add to vocab, 3: show vocab

  // Build vocabulary progressively
  const vocabulary: Record<string, number> = {};
  let nextTokenId = 1;

  for (let i = 0; i <= currentTextIndex; i++) {
    if (i < currentTextIndex || (i === currentTextIndex && currentPhase >= 2)) {
      const words = sampleTexts[i]
        .split(/(\s+|[.,!?;:])/)
        .filter((token) => token.trim().length > 0);

      words.forEach((word) => {
        if (!vocabulary[word]) {
          vocabulary[word] = nextTokenId++;
        }
      });
    }
  }

  // Get current text being processed
  const currentText =
    currentTextIndex < sampleTexts.length ? sampleTexts[currentTextIndex] : "";
  const currentWords = currentText
    .split(/(\s+|[.,!?;:])/)
    .filter((token) => token.trim().length > 0);

  return (
    <AbsoluteFill className="bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <div className="flex items-center justify-center h-full px-12">
        <div className="w-full max-w-5xl">
          {/* Main diagram area */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 mb-16">
            <div className="flex flex-col items-center space-y-12">
              {/* Current text section */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`text-2xl font-semibold tracking-wide transition-colors duration-300 ${
                    currentPhase === 0 ? "text-white/90" : "text-white/40"
                  }`}
                >
                  Input Text
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  {currentTextIndex < sampleTexts.length && (
                    <TextBox
                      text={currentText}
                      isVisible={true}
                      isCurrent={currentPhase === 0}
                    />
                  )}
                </div>
              </div>

              {/* Arrow pointing down */}
              <div className="flex justify-center">
                <div className="w-1 h-16 bg-gradient-to-b from-white/60 to-white/20 rounded-full" />
              </div>

              {/* Tokenization section */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`text-2xl font-semibold tracking-wide transition-colors duration-300 ${
                    currentPhase === 1 ? "text-white/90" : "text-white/40"
                  }`}
                >
                  Tokenization
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  {currentPhase >= 1 &&
                    currentWords.map((word, index) => (
                      <WordBox
                        key={`word-${index}`}
                        word={word}
                        isVisible={true}
                        isCurrent={currentPhase === 1}
                        index={index}
                      />
                    ))}
                </div>
              </div>

              {/* Arrow pointing down */}
              <div className="flex justify-center">
                <div className="w-1 h-16 bg-gradient-to-b from-white/60 to-white/20 rounded-full" />
              </div>

              {/* Vocabulary section */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`text-2xl font-semibold tracking-wide transition-colors duration-300 ${
                    currentPhase >= 2 ? "text-white/90" : "text-white/40"
                  }`}
                >
                  Vocabulary
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-center max-w-4xl">
                  {Object.entries(vocabulary).map(([word, tokenId], index) => {
                    const isNewWord =
                      currentPhase === 2 &&
                      currentWords.includes(word) &&
                      currentTextIndex === Math.floor(currentStep / 4);

                    return (
                      <VocabularyEntry
                        key={`vocab-${word}`}
                        word={word}
                        tokenId={tokenId}
                        isVisible={true}
                        isNew={isNewWord}
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
              label="Tokenize"
              isActive={currentPhase === 1}
              isCompleted={currentPhase > 1}
            />
            <ProcessStep
              label="Add to Vocabulary"
              isActive={currentPhase === 2}
              isCompleted={currentPhase > 2}
            />
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mt-8">
            <div className="text-xl text-white/60">
              Processing text{" "}
              {Math.min(currentTextIndex + 1, sampleTexts.length)} of{" "}
              {sampleTexts.length}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TextBox = ({
  text,
  isVisible,
  isCurrent,
}: {
  text: string;
  isVisible: boolean;
  isCurrent: boolean;
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [frame - 15, frame], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  const opacity = isVisible
    ? interpolate(frame, [frame - 20, frame - 5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    : 0;

  const getClasses = () => {
    const baseClasses =
      "px-8 py-6 rounded-xl font-medium text-3xl transition-all duration-500";

    if (isCurrent) {
      return `${baseClasses} bg-blue-500/30 text-blue-200 border border-blue-400/50 backdrop-blur-sm`;
    }

    return `${baseClasses} bg-white/5 text-white/40 border border-white/10 backdrop-blur-sm`;
  };

  return (
    <span
      className={getClasses()}
      style={{
        transform: `scale(${scale})`,
        opacity: opacity,
      }}
    >
      "{text}"
    </span>
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

  const opacity = isVisible
    ? interpolate(frame, [frame - 20, frame - 5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    : 0;

  const getClasses = () => {
    const baseClasses =
      "px-6 py-4 rounded-lg font-medium text-2xl transition-all duration-500";

    if (isCurrent) {
      return `${baseClasses} bg-green-500/30 text-green-200 border border-green-400/50 backdrop-blur-sm`;
    }

    return `${baseClasses} bg-white/5 text-white/40 border border-white/10 backdrop-blur-sm`;
  };

  return (
    <span
      className={getClasses()}
      style={{
        transform: `scale(${scale})`,
        opacity: opacity,
      }}
    >
      {word}
    </span>
  );
};

const VocabularyEntry = ({
  word,
  tokenId,
  isVisible,
  isNew,
  index,
}: {
  word: string;
  tokenId: number;
  isVisible: boolean;
  isNew: boolean;
  index: number;
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [frame - 15, frame], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  const opacity = isVisible
    ? interpolate(frame, [frame - 20, frame - 5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    : 0;

  const getClasses = () => {
    const baseClasses =
      "px-6 py-4 rounded-lg font-medium text-xl transition-all duration-500 flex items-center gap-3";

    if (isNew) {
      return `${baseClasses} bg-purple-500/30 text-purple-200 border border-purple-400/50 backdrop-blur-sm`;
    }

    return `${baseClasses} bg-white/5 text-white/40 border border-white/10 backdrop-blur-sm`;
  };

  return (
    <div
      className={getClasses()}
      style={{
        transform: `scale(${scale})`,
        opacity: opacity,
      }}
    >
      <span className="text-white/60 text-lg">#{tokenId}</span>
      <span>{word}</span>
    </div>
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
