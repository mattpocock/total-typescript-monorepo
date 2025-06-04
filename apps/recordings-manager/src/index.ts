import NodeMediaServer from "node-media-server";

const nms = new NodeMediaServer({
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: "*",
  },
});

nms.run();
console.log("RTMP Server running on rtmp://localhost:1935");

// startSpeechSegmentation();
