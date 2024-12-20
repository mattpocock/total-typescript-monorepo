import { createTwoslashFromCDN } from "twoslash-cdn";
import { CompilerOptions } from "typescript";
import { createStorage } from "unstorage";
// import localStorageDriver from "unstorage/drivers/localstorage";
import sessionStorageDriver from "unstorage/drivers/session-storage";

export const compilerOptions: any = {
  target: 9 /* ES2022 */,
  strict: true,
  allowJs: true,
  checkJs: true,
  noEmit: true,
  module: 99 /* ESNext */,
  moduleResolution: 100 /* Bundler */,
  jsx: 4 /* ReactJSX */,
} satisfies CompilerOptions;

export const twoslash = createTwoslashFromCDN({
  compilerOptions,
  storage: createStorage({}),
});
