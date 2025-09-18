import { Composition } from "remotion";
import { z } from "zod";
import { MyComposition } from "./Composition";
import { TokenComposition } from "./TokenComposition";
import { TokenizerDiagram } from "./TokenizerDiagram";
import { LLMTokenFlowDiagram } from "./LLMTokenFlowDiagram";
import { VocabularyDiagram } from "./VocabularyDiagram";
import "./index.css";
import meta from "./meta.json";
import { schema } from "./schema";

const tokenSchema = z.object({
  text: z.string(),
  tokensPerSecond: z.number().default(2),
  durationInFrames: z.number().default(300),
});

const llmTokenFlowSchema = z.object({
  inputText: z.string(),
  outputText: z.string(),
  tokensPerSecond: z.number().default(2),
  durationInFrames: z.number().default(400),
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        schema={schema}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: Math.floor(props.durationInFrames),
            fps: 60,
          };
        }}
        defaultProps={
          {
            subtitles: meta.subtitles,
            ctaDurationInFrames: Math.ceil(meta.ctaDurationInFrames),
            cta: meta.cta as "ai" | "typescript",
            durationInFrames: meta.durationInFrames,
          } satisfies z.infer<typeof schema>
        }
        width={1080}
        height={1920}
      />
      <Composition
        id="TokenDemo"
        component={TokenComposition}
        schema={tokenSchema}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: props.durationInFrames,
            fps: 60,
          };
        }}
        defaultProps={{
          text: "Large Language Models process text as tokens, which are chunks of characters that represent meaningful units of language.",
          tokensPerSecond: 2,
          durationInFrames: 1200,
        }}
        width={1080}
        height={1080}
      />
      <Composition
        id="TokenizerDiagram"
        component={TokenizerDiagram}
        schema={tokenSchema}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: props.durationInFrames,
            fps: 60,
          };
        }}
        defaultProps={{
          text: "Hello world how are you today?",
          tokensPerSecond: 1,
          durationInFrames: 600,
        }}
        width={1080}
        height={1080}
      />
      <Composition
        id="VocabularyDiagram"
        component={VocabularyDiagram}
        schema={z.object({
          tokensPerSecond: z.number().default(1),
          durationInFrames: z.number().default(800),
        })}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: props.durationInFrames,
            fps: 60,
          };
        }}
        defaultProps={{
          tokensPerSecond: 1,
          durationInFrames: 800,
        }}
        width={1080}
        height={1080}
      />
      <Composition
        id="LLMTokenFlowDiagram"
        component={LLMTokenFlowDiagram}
        schema={llmTokenFlowSchema}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: props.durationInFrames,
            fps: 60,
          };
        }}
        defaultProps={{
          inputText: "Hello world how are you today?",
          outputText: "The weather is nice today!",
          tokensPerSecond: 1.5,
          durationInFrames: 1200,
        }}
        width={1080}
        height={1080}
      />
    </>
  );
};
