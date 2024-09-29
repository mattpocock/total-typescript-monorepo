// http://localhost:3004/courses/exercises/0e67dd79-643a-4733-a9c9-876d741ab6e2/edit

import path from "path";
import { describe } from "vitest";

describe("separators", () => {
  // On Windows, this will be "\\", on POSIX it will be "/"
  const separator = path.sep;
});

describe("delimiters", () => {
  // On Windows, this will be ";", on POSIX it will be ":"
  const delimiter = path.delimiter;

  // On POSIX:
  console.log(process.env.PATH);
  // Prints: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'

  // On Windows:
  console.log(process.env.PATH);
  // Prints: 'C:\Windows\system32;C:\Windows;C:\Program Files\node\'
});
