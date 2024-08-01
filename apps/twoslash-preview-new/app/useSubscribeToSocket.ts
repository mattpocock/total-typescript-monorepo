import type { WSEvent } from "@total-typescript/twoslash-shared";
import { useEffect } from "react";

export const useSubscribeToSocket = (onNewUri: (url: string) => void) => {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");

    socket.addEventListener("message", ({ data }) => {
      console.log("message received");
      const packet: WSEvent = JSON.parse(data.toString());

      switch (packet.type) {
        case "change":
          onNewUri(packet.uri);
          break;
      }
    });

    return () => {
      socket.close();
    };
  }, []);
};
