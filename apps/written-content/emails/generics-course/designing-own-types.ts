type StreamingThing<TContent> =
  | {
      status: "available";
      content: TContent;
    }
  | {
      status: "unavailable";
      reason: string;
    };

type StreamingPlaylist = StreamingThing<{
  id: number;
  name: string;
  tracks: string[];
}>;

type StreamingAlbum = StreamingThing<{
  id: number;
  title: string;
  artist: string;
  tracks: string[];
}>;
