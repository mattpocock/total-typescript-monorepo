export type Command = {
  scriptkitName: string;
  fileName: string;
  description: string;
  cliCommand: string;
  run: () => Promise<void>;
};

export const commands: Command[] = [
  {
    scriptkitName: "Encode All Videos",
    fileName: "encode-all-videos",
    description:
      "Encode all unencoded videos in the external drive and save in place.",
    cliCommand: "encode-all-videos",
    run: async () => {
      console.log("Hello");
    },
  },
];
