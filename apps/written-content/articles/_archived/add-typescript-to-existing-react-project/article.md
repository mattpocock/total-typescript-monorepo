Adding TypeScript to an existing React project can feel like a herculean task.

Let's break it down into a few simple steps.

## Step 1: Install TypeScript

You'll first need to install TypeScript as a dev dependency:

```bash
npm install --save-dev typescript
```

## Step 2: Add a `tsconfig.json` file

Next, you'll need to add a `tsconfig.json` file to the root of your project. This file tells TypeScript how to compile your code.

I don't recommend using `tsc --init` for this. It will generate a lot of unnecessary comments and hard-to-read defaults.

Instead, I recommend going to the [tsconfig/bases](https://github.com/tsconfig/bases/tree/main/bases) repo to find a `tsconfig.json` file that matches your project.

They have different `tsconfig.json` files for different project types:

- [Create React App](https://github.com/tsconfig/bases/blob/main/bases/create-react-app.json)
- [Next.js](https://github.com/tsconfig/bases/blob/main/bases/next.json)
- [Vite with React](https://github.com/tsconfig/bases/blob/main/bases/vite-react.json)
- [Remix](https://github.com/tsconfig/bases/blob/main/bases/remix.json)
- [React Native](https://github.com/tsconfig/bases/blob/main/bases/react-native.json)

## Step 3: Change a File To `.ts` (or `.tsx`)

Next, you'll need to change a file to `.ts` (or `.tsx` if it contains a React component).

With the vast majority of modern projects, your framework of choice will be able to _just work_ with the new `.ts` file. This is because most bundlers (which frameworks use to compile your code) can handle both JavaScript and TypeScript.

If it doesn't head to that framework's TypeScript documentation to see what extra steps you need to take.

## Step 4: Begin The Migration

Now that you have TypeScript installed and a `tsconfig.json` file, you can begin the migration.

If your project is anything larger than a few files, I recommend migrating one file at a time. This will help you avoid merge conflicts and make it easier to find bugs.

It'll also mean that any existing PRs don't need to be rewritten to include the TypeScript changes.

Your project might be in a stage where it has lots of JavaScript files AND lots of TypeScript files. This is fine as an intermediate step, and you should be able to keep shipping features while this change occurs.

I recommend Sentry's [Migrating to TypeScript](https://blog.sentry.io/slow-and-steady-converting-sentrys-entire-frontend-to-typescript/) blog post for more information on how to do this.
