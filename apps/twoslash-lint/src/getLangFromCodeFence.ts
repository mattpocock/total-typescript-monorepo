export const getLangFromCodeFence = (line: string) => {
  // line will likely be "```ts twoslash", and we need to get
  // ts from it
  return line.slice(3).trim().split(" ")[0]!;
};
