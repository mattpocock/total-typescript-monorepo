import { Effect, Either, Schedule } from "effect";
import type { UnknownException } from "effect/Cause";
import { OBSWebSocket } from "obs-websocket-js";

const attemptToConnectToOBS = Effect.fn("attemptToConnectToOBS")(function* (
  obs: OBSWebSocket
) {
  yield* Effect.tryPromise(() => obs.connect("ws://192.168.1.55:4455")).pipe(
    Effect.either
  );

  return obs;
}, Effect.either);

export class OBSWatcherService extends Effect.Service<OBSWatcherService>()(
  "OBSWatcherService",
  {
    effect: Effect.gen(function* () {
      return {
        isOBSRunning: Effect.gen(function* () {
          const obs = new OBSWebSocket();

          const result = yield* attemptToConnectToOBS(obs);

          if (Either.isLeft(result)) {
            return false;
          }

          const { outputActive } = yield* Effect.tryPromise(() =>
            result.right.call("GetRecordStatus")
          );

          return outputActive;
        }),
      };
    }),
  }
) {}
