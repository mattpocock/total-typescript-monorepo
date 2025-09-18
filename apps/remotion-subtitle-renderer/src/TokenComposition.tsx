import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Simple tokenizer that splits text into words and punctuation
const tokenize = (text: string): string[] => {
  return text
    .split(/(\s+|[.,!?;:])/)
    .filter((token) => token.trim().length > 0);
};

export const TokenComposition = ({
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
  const tokens = tokenize(text);

  // Calculate how many tokens should be visible at current frame
  const tokensPerFrame = tokensPerSecond / fps;
  const visibleTokensCount = Math.min(
    Math.floor(frame * tokensPerFrame),
    tokens.length,
  );

  const visibleTokens = tokens.slice(0, visibleTokensCount);
  const currentTokenIndex = Math.floor(frame * tokensPerFrame);
  const isGenerating = currentTokenIndex < tokens.length;

  return (
    <AbsoluteFill className="bg-gradient-to-br from-gray-950 via-black to-gray-900">
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center px-12">
        <div className="max-w-6xl w-full">
          {/* Token display */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-20 mb-20">
            <div className="flex flex-wrap gap-4 items-center justify-center">
              {tokens.map((token, index) => {
                const isVisible = index < visibleTokensCount;
                const isCurrent = index === currentTokenIndex;
                const isNew = index === visibleTokensCount - 1 && isGenerating;

                return (
                  <Token
                    key={index}
                    token={token}
                    isVisible={isVisible}
                    isCurrent={isCurrent}
                    isNew={isNew}
                    index={index}
                  />
                );
              })}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="text-center">
            <div className="text-white text-3xl mb-6 font-light">
              {visibleTokensCount} of {tokens.length} tokens
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-white to-gray-300 h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${(visibleTokensCount / tokens.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Token = ({
  token,
  isVisible,
  isCurrent,
  isNew,
  index,
}: {
  token: string;
  isVisible: boolean;
  isCurrent: boolean;
  isNew: boolean;
  index: number;
}) => {
  const frame = useCurrentFrame();

  // Animation for new tokens
  const scale = interpolate(frame, [frame - 10, frame], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  const opacity = interpolate(frame, [frame - 10, frame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (!isVisible) {
    return null;
  }

  const getTokenStyle = () => {
    if (isNew) {
      return {
        transform: `scale(${scale})`,
        opacity,
      };
    }
    return {};
  };

  const getTokenClasses = () => {
    const baseClasses =
      "px-8 py-6 rounded-xl font-medium text-4xl transition-all duration-300";

    if (isNew) {
      return `${baseClasses} bg-white text-black shadow-lg`;
    }

    if (isCurrent) {
      return `${baseClasses} bg-white/20 text-white border border-white/30 backdrop-blur-sm`;
    }

    return `${baseClasses} bg-white/5 text-white/80 border border-white/10 backdrop-blur-sm`;
  };

  return (
    <span className={getTokenClasses()} style={getTokenStyle()}>
      {token}
    </span>
  );
};
