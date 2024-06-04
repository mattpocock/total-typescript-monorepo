## `twoslash-to-email <glob>`

Turns a markdown file into an email. Pass it a glob of files, and each file will be transformed into a corresponding \*.email.html file.

```bash
twoslash-to-email "src/**/*.md"
```

Any type acquisition will happen in the directory where you run the command, so make sure you have all the types you need in your local node_modules.
