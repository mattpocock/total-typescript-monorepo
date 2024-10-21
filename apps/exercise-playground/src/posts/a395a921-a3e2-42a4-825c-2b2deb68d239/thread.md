TIL you can generate diagnostic reports from inside Node itself. SUPER useful for debugging OOM errors or high CPU usage.

You can pass `--report-on-fatalerror` (or many other flags) to Node itself, or call `process.report.writeReport`:

```ts twoslash
// @noErrors
try {
  // 1. Try to change the directory to a different one
  process.chdir("/non-existent-path");
} catch (err) {
  // 2. Write the error to a human readable JSON file
  process.report.writeReport(err);
}
```

---

Here's an example of the kind of report it generates:

https://gist.github.com/mattpocock/709d3a4709103cebd9cbd422b6e70f9d
