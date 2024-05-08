```ts
declare global {
  interface ImportMetaEnv {
    MY_ENV: string;
  }
}

import.meta.env.MY_ENV; // string
```

```ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MY_ENV: string;
    }
  }
}

process.env.MY_ENV; // string
```

```ts
declare global {
  interface Window {
    MY_ENV: string;
  }
}

window.MY_ENV; // string
```
