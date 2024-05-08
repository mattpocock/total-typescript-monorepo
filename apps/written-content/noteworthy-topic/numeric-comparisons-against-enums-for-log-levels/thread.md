# Enums are kind of useful for one thing

```ts twoslash
enum LogLevel {
  Debug,
  Warn,
  Error,
}
```

```ts twoslash
enum LogLevel {
  Debug,
  Warn,
  Error,
}

function log(level: LogLevel, message: string) {
  if (level > LogLevel.Debug) {
    console.log(message);
  }
}
```

```ts twoslash
const LOG_LEVELS = {
  Debug: 0,
  Warn: 1,
  Error: 2,
} as const;

type LogLevel =
  (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

function log(level: LogLevel, message: string) {
  if (level > LOG_LEVELS.Debug) {
    console.log(message);
  }
}
```
