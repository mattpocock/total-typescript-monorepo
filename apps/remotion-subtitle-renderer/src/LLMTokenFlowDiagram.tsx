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
  The: 11,
  weather: 12,
  is: 13,
  nice: 14,
  today: 6,
};

// Reverse vocabulary for decoding
const reverseVocabulary = Object.fromEntries(
  Object.entries(vocabulary).map(([word, id]) => [id, word]),
);

export const LLMTokenFlowDiagram = ({
  inputText,
  outputText,
  tokensPerSecond,
  durationInFrames,
}: {
  inputText: string;
  outputText: string;
  tokensPerSecond: number;
  durationInFrames: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tokenize the input text
  const inputWords = inputText
    .split(/(\s+|[.,!?;:])/)
    .filter((token) => token.trim().length > 0);
  const inputTokens = inputWords.map((word) => (vocabulary as any)[word] || 0);

  // Tokenize the output text
  const outputWords = outputText
    .split(/(\s+|[.,!?;:])/)
    .filter((token) => token.trim().length > 0);
  const outputTokens = outputWords.map(
    (word) => (vocabulary as any)[word] || 0,
  );

  // Calculate animation progress
  const tokensPerFrame = tokensPerSecond / fps;
  const totalSteps = inputWords.length + outputWords.length + 1; // input processing + LLM + output processing
  const currentStep = Math.min(Math.floor(frame * tokensPerFrame), totalSteps);

  // Determine current phase and indices
  let currentPhase = 0; // 0: input processing, 1: LLM processing, 2: output processing
  let inputIndex = 0;
  let outputIndex = 0;

  if (currentStep < inputWords.length) {
    currentPhase = 0;
    inputIndex = currentStep;
  } else if (currentStep < inputWords.length + 1) {
    currentPhase = 1;
    inputIndex = inputWords.length; // All input tokens visible
  } else {
    currentPhase = 2;
    inputIndex = inputWords.length; // All input tokens visible
    outputIndex = currentStep - inputWords.length - 1;
  }

  return (
    <AbsoluteFill className="bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <div className="flex items-center justify-center h-full px-8">
        <div className="w-full max-w-5xl">
          {/* Main diagram area - Square aspect ratio */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 mb-12 aspect-square">
            <div className="grid grid-cols-3 gap-8 h-full">
              {/* Left Column - Input */}
              <div className="flex flex-col justify-center space-y-12">
                {/* Input Text */}
                <div className="flex flex-col items-center space-y-6">
                  <div
                    className={`text-3xl font-semibold tracking-wide transition-colors duration-300 ${
                      currentPhase === 0 ? "text-white/90" : "text-white/40"
                    }`}
                  >
                    Input Text
                  </div>
                  <div className="flex flex-wrap gap-3 items-center justify-center">
                    {inputWords.map((word, index) => {
                      const isVisible = index < inputIndex;
                      const isCurrent =
                        index === inputIndex - 1 && currentPhase === 0;

                      return (
                        <WordBox
                          key={`input-word-${index}`}
                          word={word}
                          isVisible={isVisible}
                          isCurrent={isCurrent}
                          index={index}
                          color="blue"
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Vertical line */}
                <div className="flex justify-center">
                  <div className="w-1 h-16 bg-gradient-to-b from-white/60 to-white/20 rounded-full" />
                </div>

                {/* Input Tokens */}
                <div className="flex flex-col items-center space-y-6">
                  <div
                    className={`text-3xl font-semibold tracking-wide transition-colors duration-300 ${
                      currentPhase === 0 ? "text-white/90" : "text-white/40"
                    }`}
                  >
                    Input Tokens
                  </div>
                  <div className="flex flex-wrap gap-3 items-center justify-center">
                    {inputTokens.map((token, index) => {
                      const isVisible = index < inputIndex;
                      const isCurrent =
                        index === inputIndex - 1 && currentPhase === 0;

                      return (
                        <TokenBox
                          key={`input-token-${index}`}
                          token={token}
                          isVisible={isVisible}
                          isCurrent={isCurrent}
                          index={index}
                          color="green"
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Center Column - LLM Processing */}
              <div className="flex items-center justify-center">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <div
                    className={`text-4xl font-bold text-center transition-colors duration-300 ${
                      currentPhase === 1 ? "text-white/90" : "text-white/40"
                    }`}
                  >
                    LLM
                  </div>
                  <div
                    className={`text-lg text-center mt-2 transition-colors duration-300 ${
                      currentPhase === 1 ? "text-white/70" : "text-white/30"
                    }`}
                  >
                    Processing
                  </div>
                  {currentPhase === 1 && (
                    <div className="flex justify-center mt-4">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-white/60 rounded-full animate-pulse"
                            style={{
                              animationDelay: `${i * 0.2}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Output */}
              <div className="flex flex-col justify-center space-y-12">
                {/* Output Tokens */}
                <div className="flex flex-col items-center space-y-6">
                  <div
                    className={`text-3xl font-semibold tracking-wide transition-colors duration-300 ${
                      currentPhase === 2 ? "text-white/90" : "text-white/40"
                    }`}
                  >
                    Output Tokens
                  </div>
                  <div className="flex flex-wrap gap-3 items-center justify-center">
                    {outputTokens.map((token, index) => {
                      const isVisible = index < outputIndex;
                      const isCurrent =
                        index === outputIndex - 1 && currentPhase === 2;

                      return (
                        <TokenBox
                          key={`output-token-${index}`}
                          token={token}
                          isVisible={isVisible}
                          isCurrent={isCurrent}
                          index={index}
                          color="orange"
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Vertical line */}
                <div className="flex justify-center">
                  <div className="w-1 h-16 bg-gradient-to-b from-white/60 to-white/20 rounded-full" />
                </div>

                {/* Output Text */}
                <div className="flex flex-col items-center space-y-6">
                  <div
                    className={`text-3xl font-semibold tracking-wide transition-colors duration-300 ${
                      currentPhase === 2 ? "text-white/90" : "text-white/40"
                    }`}
                  >
                    Output Text
                  </div>
                  <div className="flex flex-wrap gap-3 items-center justify-center">
                    {outputWords.map((word, index) => {
                      const isVisible = index < outputIndex;
                      const isCurrent =
                        index === outputIndex - 1 && currentPhase === 2;

                      return (
                        <WordBox
                          key={`output-word-${index}`}
                          word={word}
                          isVisible={isVisible}
                          isCurrent={isCurrent}
                          index={index}
                          color="purple"
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Process indicators */}
          <div className="flex justify-center space-x-6">
            <ProcessStep
              label="Tokenize"
              isActive={currentPhase === 0}
              isCompleted={currentPhase > 0}
            />
            <ProcessStep
              label="LLM Process"
              isActive={currentPhase === 1}
              isCompleted={currentPhase > 1}
            />
            <ProcessStep
              label="Detokenize"
              isActive={currentPhase === 2}
              isCompleted={currentPhase > 2}
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
  color,
}: {
  word: string;
  isVisible: boolean;
  isCurrent: boolean;
  index: number;
  color: "blue" | "purple";
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [frame - 10, frame], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  if (!isVisible) {
    return null;
  }

  const getClasses = () => {
    const baseClasses =
      "px-6 py-4 rounded-lg font-medium text-2xl transition-all duration-500";

    if (isCurrent) {
      if (color === "blue") {
        return `${baseClasses} bg-blue-500/30 text-blue-200 border border-blue-400/50 backdrop-blur-sm`;
      } else {
        return `${baseClasses} bg-purple-500/30 text-purple-200 border border-purple-400/50 backdrop-blur-sm`;
      }
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
  color,
}: {
  token: number;
  isVisible: boolean;
  isCurrent: boolean;
  index: number;
  color: "green" | "orange";
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [frame - 10, frame], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  if (!isVisible) {
    return null;
  }

  const getClasses = () => {
    const baseClasses =
      "px-6 py-4 rounded-lg font-medium text-2xl transition-all duration-500";

    if (isCurrent) {
      if (color === "green") {
        return `${baseClasses} bg-green-500/30 text-green-200 border border-green-400/50 backdrop-blur-sm`;
      } else {
        return `${baseClasses} bg-orange-500/30 text-orange-200 border border-orange-400/50 backdrop-blur-sm`;
      }
    }

    return `${baseClasses} bg-white/5 text-white/40 border border-white/10 backdrop-blur-sm`;
  };

  return (
    <span className={getClasses()} style={{ transform: `scale(${scale})` }}>
      {token}
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
