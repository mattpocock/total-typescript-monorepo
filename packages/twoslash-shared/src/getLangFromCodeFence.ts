export const getLangFromCodeFence = (line: string) => {
  // line will likely be "```ts twoslash", and we need to get
  // ts from it
  const args = line.slice(3).trim().split(" ");

  const lang = args[0];

  return {
    lang,
    mode: args[1],
  };
};
