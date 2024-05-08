You'll often find folks talking about "TypeScript Performance". They might say "my codebase feels slow" and that "TypeScript is making my editor slow".

What do they mean?

## What is TypeScript Performance?

TypeScript performance is a measure of how fast TypeScript can type-check your codebase. It's a measure of how quickly your editor can provide feedback on your code.

It's NOT a measure of how fast your code runs. TypeScript is a compile-time tool, not a runtime tool. Simply using TypeScript will not change the speed at which the emitted JavaScript runs - TypeScript doesn't do anything at runtime.

## What Does Bad TypeScript Performance Look Like?

When TypeScript performance is poor, you will notice:

- Your editor is slow to provide feedback on your code.
- Your editor is slow to autocomplete.
- Your builds take a long time to complete.

In other words, the things you do every day become slower and more painful.

## What Causes Bad TypeScript Performance?

TypeScript performance can be affected by several factors.

The first is scale. Simply put, the more code TypeScript needs to check at once, the slower it will run. However, scale is often less of a factor than you might think.

The second factor is the way you write your code. Using intersections instead of interfaces, utilizing project references, and employing return types judiciously are all useful ways to address TypeScript performance issues.

The [TypeScript Performance Wiki](https://github.com/microsoft/TypeScript/wiki/Performance) provides a great list of strategies you can use to improve your TypeScript performance.

## How Do You Measure TypeScript Performance?

You can use some `tsc` flags to measure your TypeScript performance.

Using `tsc --diagnostics` or `tsc --extendedDiagnostics` will provide you with information about how long it takes TypeScript to type-check your codebase.

By running `tsc --generateTrace ./outDir`, you can generate a trace file that can be opened in [Chrome's Trace Viewer](chrome://tracing) to see where TypeScript is spending its time.

[Aleksandra Sikora](https://twitter.com/aleksandrasays)'s [excellent talk at BeJS](https://www.youtube.com/watch?v=lJ63-j0OHG0) is a great resource to begin exploring this topic.
