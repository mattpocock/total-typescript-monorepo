import { Context, Effect, pipe } from "effect";
import { exec, type ExecOptions } from "child_process";
import type { ObjectEncodingOptions } from "fs";
import type { ExecException } from "child_process";

type ExecServiceShape = {
  exec: (
    command: string,
    opts?: Omit<ExecOptions, "signal"> & ObjectEncodingOptions
  ) => Effect.Effect<{ stdout: string; stderr: string }, ExecException>;
};

export class ExecService extends Context.Tag("ExecService")<
  ExecService,
  ExecServiceShape
>() {}

export const realExecService = ExecService.of({
  exec: (command, opts) => {
    return pipe(
      Effect.tryPromise<{ stdout: string; stderr: string }>((signal) => {
        return new Promise((resolve, reject) => {
          exec(command, { ...opts, signal }, (e, stdout, stderr) => {
            if (e) {
              reject(e);
            }

            resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
          });
        });
      }),
      Effect.catchAll((e) => {
        return Effect.fail(e as ExecException);
      })
    );
  },
});
