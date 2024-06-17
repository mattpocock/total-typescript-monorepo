import { useCurrentFrame, useVideoConfig } from "remotion";

export function ProgressBar({ steps }: { steps: unknown[] }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const stepDuration = durationInFrames / steps.length;
  const currentStep = Math.floor(frame / stepDuration);
  const currentStepProgress = (frame % stepDuration) / stepDuration;

  return (
    <div
      style={{
        position: "absolute",
        top: 48,
        left: 48,
        right: 48,
        height: 6,
        display: "flex",
        gap: 12,
      }}
    >
      {steps.map((_, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "#333",
            borderRadius: 6,
            overflow: "hidden",
            height: "100%",
            flex: 1,
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: "white",
              width:
                index > currentStep
                  ? 0
                  : index === currentStep
                    ? currentStepProgress * 100 + "%"
                    : "100%",
            }}
          />
        </div>
      ))}
    </div>
  );
}
