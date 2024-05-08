declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string;
    // more env variables...
  }
}

import.meta.env;
