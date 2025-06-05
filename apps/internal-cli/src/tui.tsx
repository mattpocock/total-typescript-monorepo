import React, {
  useEffect,
  useState,
  useSyncExternalStore,
  useMemo,
} from "react";
import { render, Text, Box } from "ink";
import OBSWebSocket from "obs-websocket-js";

interface RunnerState {
  status: "recording" | "not-recording";
  latestFile: string | null;
}

class Runner {
  private obs: OBSWebSocket;
  private latestRecordStateChanged:
    | {
        outputActive: boolean;
        outputState: string;
        outputPath: string;
      }
    | undefined;
  private subscribers: Map<string, () => void> = new Map();
  private currentState: RunnerState = {
    status: "not-recording",
    latestFile: null,
  };

  constructor() {
    this.obs = new OBSWebSocket();
    this.start();
  }

  private start() {
    this.subscribeToOBS();
  }

  private async subscribeToOBS() {
    await this.obs.connect("ws://192.168.1.55:4455");

    this.obs.on("RecordStateChanged", (data) => {
      this.latestRecordStateChanged = data;
      const newState = this.getState();

      // Only notify subscribers if the state has actually changed
      if (
        newState.status !== this.currentState.status ||
        newState.latestFile !== this.currentState.latestFile
      ) {
        this.currentState = newState;
        this.notifySubscribers();
      }
    });
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => {
      callback();
    });
  }

  getState = (): RunnerState => {
    return {
      status:
        this.latestRecordStateChanged?.outputState ===
        "OBS_WEBSOCKET_OUTPUT_STARTED"
          ? "recording"
          : "not-recording",
      latestFile: this.latestRecordStateChanged?.outputPath ?? null,
    };
  };

  subscribe = (callback: () => void) => {
    const id = crypto.randomUUID();
    this.subscribers.set(id, callback);

    return () => {
      this.subscribers.delete(id);
    };
  };
}

const Counter = ({ runner }: { runner: Runner }) => {
  const state = useSyncExternalStore(runner.subscribe, runner.getState);

  // Memoize the rendered content to prevent unnecessary re-renders
  const content = useMemo(
    () => (
      <Box>
        <Box borderStyle="single" paddingX={1}>
          {state.status === "recording" ? (
            <Text color="red">🔴 Recording</Text>
          ) : (
            <Text color="green">🟢 Not Recording</Text>
          )}
        </Box>
      </Box>
    ),
    [state.status]
  );

  return content;
};

export const renderTUI = () => {
  const runner = new Runner();
  render(<Counter runner={runner} />);
};
