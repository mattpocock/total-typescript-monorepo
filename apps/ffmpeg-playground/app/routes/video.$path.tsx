import { LoaderFunctionArgs, defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { AbsolutePath } from "@total-typescript/shared";
import {
  PADDING,
  SILENCE_DURATION,
  THRESHOLD,
  findSilenceInVideo,
  getFPS,
  getVideoDuration,
  getWaveFormData,
} from "@total-typescript/ffmpeg";
import { Suspense, useEffect, useRef, useState } from "react";

/**
 * Take an array of data and force it to be a certain size by sampling from it.
 */
const sampleData = <T,>(data: T[], sampleSize: number) => {
  const sampledData: T[] = [];

  for (let i = 0; i < sampleSize; i += 1) {
    const index = Math.floor((i / sampleSize) * data.length);
    sampledData.push(data[index]);
  }

  return sampledData;
};

const VIDEO_WIDTH = 720;
const SAMPLE_SIZE = 720 / 2;

const getWaveFormDataWithMeta = async (path: AbsolutePath) => {
  const waveformData = await getWaveFormData(path);

  const sampledData = await sampleData(waveformData, SAMPLE_SIZE);

  const lowestAmplitude = Math.min(...sampledData);

  return { sampledData, lowestAmplitude };
};

export const loader = async (args: LoaderFunctionArgs) => {
  const path = args.params.path as AbsolutePath;

  const fps = await getFPS(path);

  const silencePromise = findSilenceInVideo(path, {
    fps,
    padding: PADDING,
    silenceDuration: SILENCE_DURATION,
    threshold: THRESHOLD,
  });

  const videoDurationPromise = getVideoDuration(path);

  return defer(
    {
      path,
      waveformPromise: getWaveFormDataWithMeta(path),
      silencePromise,
      videoDurationPromise,
      fps,
    },
    {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
      },
    },
  );
};

export default function Video() {
  const data = useLoaderData<typeof loader>();

  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleTimeUpdate = () => {
      setVideoCurrentTime(videoRef.current?.currentTime ?? 0);
    };
    const videoElement = videoRef.current;
    videoElement?.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoElement?.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  return (
    <div>
      <h1>Video</h1>
      <video
        ref={videoRef}
        src={`/video-file/${encodeURIComponent(data.path)}`}
        controls
        width={VIDEO_WIDTH}
      >
        <track kind="captions" />
      </video>
      <Suspense fallback={<div>Calculating Waveform...</div>}>
        <Await resolve={data.videoDurationPromise}>
          {(videoDuration) => {
            return (
              <Await resolve={data.waveformPromise}>
                {(waveformData) => {
                  const heightOfWaveform = 0 - waveformData.lowestAmplitude;
                  const pixelSize = VIDEO_WIDTH / videoDuration;

                  return (
                    <div
                      style={{
                        width: VIDEO_WIDTH,
                        display: "flex",
                        position: "relative",
                      }}
                    >
                      {waveformData.sampledData.map((num, index) => {
                        const distanceFromTop = 0 - num;
                        return (
                          <div
                            key={index}
                            style={{
                              marginTop: distanceFromTop,
                              height: heightOfWaveform - distanceFromTop,
                              width: VIDEO_WIDTH / SAMPLE_SIZE,
                              backgroundColor: "black",
                            }}
                          ></div>
                        );
                      })}
                      <Await resolve={data.silencePromise}>
                        {(silence) => {
                          return (
                            <>
                              {silence.speakingClips.map((clip) => {
                                return (
                                  <button
                                    key={clip.startFrame}
                                    style={{
                                      backgroundColor: "rgba(255, 0, 0, 0.4)",
                                      position: "absolute",
                                      top: 0,
                                      border: "none",
                                      left: pixelSize * clip.startTime,
                                      width:
                                        pixelSize *
                                        (clip.endTime - clip.startTime),
                                      height: heightOfWaveform,
                                    }}
                                    onClick={() => {
                                      if (videoRef.current) {
                                        videoRef.current.currentTime =
                                          Math.floor(clip.startTime);
                                      }
                                    }}
                                  ></button>
                                );
                              })}
                            </>
                          );
                        }}
                      </Await>
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: pixelSize * videoCurrentTime,
                          width: 2,
                          height: heightOfWaveform,
                          backgroundColor: "red",
                        }}
                      />
                    </div>
                  );
                }}
              </Await>
            );
          }}
        </Await>
      </Suspense>
      <Suspense>
        <Await resolve={data.silencePromise}>
          {(silence) => {
            return (
              <pre>
                {JSON.stringify(
                  {
                    speakingClips: silence.speakingClips,
                  },
                  null,
                  2,
                )}
              </pre>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
