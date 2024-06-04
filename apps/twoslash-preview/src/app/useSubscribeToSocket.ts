import { CodeSnippet, WSEvent } from "@total-typescript/twoslash-shared";
import { useEffect, useState } from "react";

export const useSubscribeToSocket = () => {
  const [state, setState] = useState<{
    html: string | null;
    snippets: CodeSnippet[];
  }>({
    html: null,
    snippets: [],
  });

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");

    // receive a message from the server
    socket.addEventListener("message", ({ data }) => {
      console.log("message received");
      const packet: WSEvent = JSON.parse(data.toString());

      switch (packet.type) {
        case "new-html":
          setState({
            html: packet.html,
            snippets: packet.snippets,
          });
          break;
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  return state;
};
