import { useFetcher } from "@remix-run/react";
import type { MultiJsonInput } from "./routes/multi-json";
import { jsonActionUrl } from "./routes";
import { useDebounceFetcher } from "./use-debounced-fetcher";

export const useJsonFetcher = () => {
  const fetcher = useFetcher();

  return {
    ...fetcher,
    submit: async (input: MultiJsonInput) => {
      await fetcher.submit(input, {
        method: "POST",
        encType: "application/json",
        action: jsonActionUrl(),
        preventScrollReset: true,
        unstable_flushSync: true,
      });
    },
  };
};

export const useDebounceJsonFetcher = () => {
  const fetcher = useDebounceFetcher();

  return {
    submit: async (input: MultiJsonInput) => {
      await fetcher.submit(input, {
        method: "POST",
        encType: "application/json",
        action: jsonActionUrl(),
        preventScrollReset: true,
      });
    },
  };
};
