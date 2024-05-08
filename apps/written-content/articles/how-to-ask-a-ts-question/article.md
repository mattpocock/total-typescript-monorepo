You have likely been sent this article because you asked someone a TypeScript question without providing a TypeScript playground.

Here's how to fix it.

1. Go to the [TypeScript Playground](https://www.typescriptlang.org/play).

2. Write your code in the editor. You can use libraries from `npm` (by simply importing them) if needed.

3. If your code doesn't fit in the editor, make your example simpler and smaller. The less code you ask someone to read, the more likely they are to help you.

4. Make sure you comment your code to show what you expect to happen.

```ts twoslash
// `a` should be inferred as a string, but it's a number...
const a = 1;
```

5. Consider using [`@ts-expect-error`](https://www.totaltypescript.com/concepts/how-to-use-ts-expect-error) to show where errors are expected in your code.

6. Make sure your code has NO errors except for the ones you expect to be there.

7. Save the playground. This will provide you with a URL that you can share with others.

8. If you asked the question on a platform that doesn't support sharing links (like YouTube comments), head to my [Discord Channel](https://totaltypescript.com/discord) to ask it.

## Why Not A Screenshot?

If you provided a screenshot to illustrate your problem, you might be over-estimating the skill of the developers you're asking for help.

Most developers can't just look at a screenshot and know exactly what the error is. They need to _play_ with code in order to understand what it does. For this, you need an IDE.

This is why the TypeScript playground is so useful - it provides shareable playgrounds that help facilitate collaboration.

## Why Not CodeSandbox/StackBlitz?

There are several tools out there that help provide a multi-file IDE with support for actually _running_ code.

These are great for sharing code, but they're not great for asking questions.

I've had many situations where people ask me a question using a StackBlitz/CodeSandbox link, and I have to spend 10 minutes trying to figure out what the problem is, or even _in which file_ it originates from.

So, I've learned to dread these links.

The TypeScript playground is a much better tool for asking questions, because it provides a single file with a single entry point.
