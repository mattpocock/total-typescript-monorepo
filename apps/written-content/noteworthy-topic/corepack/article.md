I've just learned about `corepack`, a tool that bundles with Node.js and solves a bunch of problems with handling package managers. But I'll be using it in my development setup from now on.

## Quick Start

### Step 1. Global Install

`corepack` is bundled with Node.js, and has been since Node.js 14.19. So, if you have Node.js, you have `corepack`.

You can enable `corepack` on your machine by running the following command:

```sh
corepack enable && corepack enable npm
```

This enables `corepack` globally - you don't need to enable it per project.

### Step 2. Configure Your Project

`corepack` makes sure you're using the correct package manager for your project. To configure the package manager for your project, add the `packageManager` field to your `package.json`:

```json
{
  // npm
  "packageManager": "npm@10.8.1",
  // pnpm
  "packageManager": "pnpm@9.1.4",
  // yarn
  "packageManager": "yarn@3.1.1"
}
```

You must specify an _exact_ version of the package manager you want to use - not a range. All of the below are not valid:

```json
{
  // not valid: uses a range
  "packageManager": "npm@^10.8.1",

  // not valid: specifies 'latest'
  "packageManager": "pnpm@latest",

  // not valid: must specify an exact version
  "packageManager": "yarn"
}
```

### Step 3. Try It Out

Now, if you try to `npm install` in a project that has `packageManager` set to `pnpm`, `corepack` will show an error:

```
Usage Error: This project is configured to use npm

$ pnpm ...
```

And if you try to `pnpm install` there, `corepack` will automatically download and use the correct `pnpm` version:

```
Corepack is about to download https://registry.npmjs.org/pnpm/-/pnpm-9.1.4.tgz.

Do you want to continue? [Y/n]
```

This ensures you're always using the correct package manager for your project.

## Why Use Corepack?

I ran out of time to continue writing this article. Want me to keep going? What questions do you have? Let me know:

<FeedbackFormButton />
