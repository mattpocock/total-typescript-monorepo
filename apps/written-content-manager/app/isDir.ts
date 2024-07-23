const fileWithExtensionRegex = /\.[a-z]{1,}$/;

export const isDir = (file: string) => {
  return !fileWithExtensionRegex.test(file);
};
