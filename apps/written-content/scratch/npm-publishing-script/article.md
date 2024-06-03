FACE: You've got some code you want to share with the world.

FACE: It's a hot new library. It's going to change the way we write code.

FACE: But, it's stuck on your bloomin' laptop. How do you get it out there to the people?

FACE: I guess you could zip it up and, like, email it to people.

B-ROLL(npm): Or, you could put it on `npm` - a site where folks upload their code for others to use.

FACE: That sounds good. Except - it can be bloody difficult.

B-ROLL(https://blog.isquaredsoftware.com/2023/08/esm-modernization-lessons): There are tons of different approaches, all with different pro's and cons.

FACE: I made a video on this last year, but things have changed since.

FACE: So, I'll show you my new recommended setup for publishing to `npm`.

## Package Setup

CODE: We'll start from an empty directory. Let's run `git init` to kick off a git repo.

```bash
git init
```

CODE: We'll add a file called .gitignore and add node_modules to it.

```bash
echo "node_modules" > .gitignore
```

CODE: Now, let's run `npm init -y` to create a package.json file.

```bash
npm init -y
```

CODE: Let's change the name of our package to `@total-typescript/hello`:

```json
{
  "name": "@total-typescript/hello",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

CODE: We'll change the license to MIT:

```json
{
  "name": "@total-typescript/hello",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: We'll bump the version to `0.0.1`:

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: If you've got it, you can add the `repository` field to your package.json:

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/total-typescript/hello.git"
  }
}
```

CODE: And the docs homepage of the repo:

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/total-typescript/hello.git"
  },
  "homepage": "https://totaltypescript.com"
}
```

CODE: Also, we're going to add `type: module` to our package.json:

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: `type: module` tells Node.js to treat our code as ES modules.

FACE: This is a change from last year. In last year's video, we used `tsup`...

B-ROLL (tsup): ...to bundle our code into both ES modules and CommonJS.

FACE: But now, I recommend only shipping ES modules.

## TypeScript

CODE: Let's install some dependencies we know we'll need. I'll start off with `typescript`.

```bash
npm install -D typescript
```

FACE: TypeScript will make sure our code is type-safe, and turn our TypeScript code into JavaScript.

CODE: Let's now add a `tsconfig.json`:

```bash
echo '{}' > tsconfig.json
```

FACE: TSConfigs can be a pain, so let's install my config package to make it easier.

CODE: We'll install `@total-typescript/tsconfig`:

```bash
npm install -D @total-typescript/tsconfig
```

CODE: Then, we'll extend it in our `tsconfig.json`.

```json
{
  "extends": "@total-typescript/tsconfig"
}
```

CODE: We're using `tsc` to bundle our code, so let's add that:

```json
{
  "extends": "@total-typescript/tsconfig/tsc"
}
```

CODE: Our code doesn't run in the DOM, so let's add `no-dom`:

```json
{
  "extends": "@total-typescript/tsconfig/tsc/no-dom"
}
```

CODE: And we're creating a library, not an app:

```json
{
  "extends": "@total-typescript/tsconfig/tsc/no-dom/library"
}
```

FACE: This is my recommended set of defaults for TypeScript libraries. It's opinionated, but super-robust.

FACE: (looking towards camera) Just like me. Hah!

FACE: The only thing it doesn't specify is where the code is, and where it's outputted.

CODE: We'll need to add some `compilerOptions`:

```json
{
  "extends": "@total-typescript/tsconfig/tsc/no-dom/library",
  "compilerOptions": {}
}
```

CODE: We want to make our root directory `src`...

```json
{
  "extends": "@total-typescript/tsconfig/tsc/no-dom/library",
  "compilerOptions": {
    "rootDir": "src"
  }
}
```

CODE: Then make our output directory `dist`:

```json
{
  "extends": "@total-typescript/tsconfig/tsc/no-dom/library",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  }
}
```

CODE: Let's add a `src` directory and an `index.ts` file.

CODE: Inside, we'll export a function called `hello`:

```ts
export const hello = (name: string) => `Hello, ${name}!`;
```

CODE: This code is in TypeScript, so it can't be uploaded to `npm` quite yet.

FACE: Packages on `npm` need to be in JavaScript, not TypeScript.

FACE: You don't know ahead of time who's going to be using your package, and they might not have TypeScript set up.

CODE: We'll do this via a `build` script in the package.json:

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": ""
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: We'll use the TypeScript CLI to compile our code:

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "tsc"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: Let's run `npm run build` to compile our code.

```bash
npm run build
```

CODE: This will create an `index.js` file in the `dist` directory.

CODE: If we compare them, we'll see how similar the JavaScript is to the emitted TypeScript.

CODE: It's just the types that are stripped out.

FACE: You'll be thankful for this if you ever get a runtime error from your library.

FACE: Having code that looks like your TypeScript makes debugging a lot easier.

FACE: But, hey, you're never going to get a runtime error from your code! (looks thoughtful)

## Testing

CODE: Let's add vitest for testing.

```bash
npm install -D vitest
```

CODE: We'll add a `test` script to our package.json:

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: Next, we'll add an index.test.ts file in the `src` directory.

```ts
import { hello } from "./index";
import { test, expect } from "vitest";

test("hello", () => {
  expect(hello("world")).toBe("Hello, world!");
});
```

CODE: Let's run `npm test` to run our tests.

```bash
npm test
```

CODE: And there we go! Our tests are passing.

CODE: Let's also add a `ci` script to our package.json:

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "ci": "npm run build && npm test"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: I like having this command as a convention...

FACE: ...because it means I can quickly check my code before I push it.

FACE: It also makes running checks on CI easier.

CODE: But, every time I change the code, I now need to run `npm run ci` to check if what I've done is okay.

FACE: How do I make it so it watches me while I work?

## Dev Script

FACE: When we're working on our code, we want two things to happen at the same time.

CODE: I'm going to add two scripts in our `package.json`: `dev:tsc` and `dev:test`.

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "ci": "npm run build && npm test",
    "dev:tsc": "",
    "dev:test": ""
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: In `dev:tsc`, we'll run `tsc --watch`:

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "ci": "npm run build && npm test",
    "dev:tsc": "tsc --watch",
    "dev:test": ""
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: This watches our TypeScript code and compiles it to JavaScript whenever we make a change.

CODE: Also, if we make a mistake in our code...

```ts
export const hello = (name: string) => `Hello, ${name}!`;

hello(1);
```

CODE: We'll see it show up in our terminal.

CODE: In `dev:test`, we'll run `vitest`:

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "ci": "npm run build && npm test",
    "dev:tsc": "tsc --watch",
    "dev:test": "vitest"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: This watches our test files and runs them whenever we make a change.

CODE: Yeah, the default behavior of `vitest` is to watch the files - `vitest run` only runs the tests once.

CODE: Now, we could run `npm run dev:tsc` and `npm run dev:test` in separate terminals...

FACE: ...but that's a bit of a drag. Let's make it so we can run them both at the same time.

FACE: And, of course, there's a package for that.

CODE: We'll install `concurrently`:

```bash
npm install -D concurrently
```

CODE: And then we'll add a `dev` script to our package.json:

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "ci": "npm run build && npm test",
    "dev:tsc": "tsc --watch",
    "dev:test": "vitest",
    "dev": "concurrently \"npm:dev:*\""
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: This runs all the scripts starting with `dev:` at the same time.

CODE: We can see in the output which script each line came from.

FACE: So now, we can run a single command, `dev`, to run all our local development commands.

FACE: And we've got one command, `ci`, to check our code before we push it.

FACE: This is great, we're about done with the local development setup.

FACE: Let's now get this package up to `npm`.

## Publishing The First Version

FACE: I'm going to assume a few things. I'm going to assume you've got an...

B-ROLL(npm): `npm` account, and that you've...

B-ROLL(npm login): logged in via the CLI...

FACE: ...and that you've got a package name in mind. Because every package name on `npm` has to be unique.

CODE: Then, we can run `npm publish` to publish our package.

```bash
npm publish
```

CODE: But let's be cautious, and do a dry run first:

```bash
npm publish --dry-run
```

CODE: We'll see a list of all the files that will be uploaded.

FACE: I can already see some issues. We only want to upload files that will be useful to the end user.

CODE: We can tell `npm` to ignore certain files by adding a `.npmignore` file.

CODE: We can add `src` and `tsconfig.json` to it:

```txt
src
tsconfig.json
```

CODE: We need to upload `dist`, our `package.json`, and a readme when we have it.

CODE: In fact, let's add a readme now.

CODE: If we dry run again, we can see our readme file is included, but not our `src` directory or `tsconfig.json`.

```bash
npm publish --dry-run
```

FACE: So, I think we might be ready!

CODE: Let's run `npm publish` to publish our package.

```bash
npm publish
```

CODE: And there we go! Our package is now on `npm`.

B-ROLL(npm): We can see it on the `npm` registry, with our beautiful readme.

B-ROLL(npm): We can even check what code got uploaded, just like we saw in our dry runs.

FACE: We now need to check if our package is working. We could install it and check it locally, but there's a faster way.

## Are The Types Wrong?

FACE: A member of the TypeScript team called...

B-Roll(twitter): ...Andrew Branch has built a set of tools called...

B-ROLL(attw): 'Are The Types Wrong'? We can search our package on there to see if the types are correct.

B-ROLL(attw): And, ah, they very much are not.

FACE: We forgot a few things when we published our first package. It happens - that's what patch versions are for.

FACE: Before we fix it, let's make sure that this never happens again.

CODE: We can install `are the types wrong` locally:

```bash
npm install -D @arethetypeswrong/cli
```

CODE: And add a script called `check-types` to our `package.json`:

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "ci": "npm run build && npm test",
    "dev:tsc": "tsc --watch",
    "dev:test": "vitest",
    "dev": "concurrently \"npm:dev:*\"",
    "check-types": "attw --pack ."
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: This runs "are the types wrong" --pack on our package, doing the same checks as we did on the website.

CODE: Let's add this to our `ci` script...

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "ci": "npm run build && npm test && npm run check-types",
    "dev:tsc": "tsc --watch",
    "dev:test": "vitest",
    "dev": "concurrently \"npm:dev:*\"",
    "check-types": "attw --pack ."
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: And run it.

CODE: And yep, we're getting the same errors we saw on the website.

FACE: The reason we're getting these errors is that we've missed a step in how we understand packages.

## Package Exports

CODE: When someone imports your package, a few things happen.

```ts
import { hello } from "@total-typescript/hello";
```

FACE: First, the import looks at the `package.json` of that package.

CODE: It's looking through the package trying to find a clue for where the code is stored.

CODE: If it's a super old version of Node, it might need to look at the `main` field. Currently, our `main` field is set to `index.js`.

CODE: So, let's change that to where we know our compiled output is - `dist/index.js`

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "./dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "ci": "npm run build && npm test && npm run check-types",
    "dev:tsc": "tsc --watch",
    "dev:test": "vitest",
    "dev": "concurrently \"npm:dev:*\"",
    "check-types": "attw --pack ."
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: Now, we can run `npm run ci` again to check if our type errors have gone away.

CODE: And, nice, they have!

CODE: Another field you can use in your `package.json` is `exports`.

```json
{
  "name": "@total-typescript/hello",
  "version": "0.0.1",
  "description": "",
  "main": "./dist/index.js",
  "exports": {
    ".": "./dist/index.js"
  },
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "ci": "npm run build && npm test && npm run check-types",
    "dev:tsc": "tsc --watch",
    "dev:test": "vitest",
    "dev": "concurrently \"npm:dev:*\"",
    "check-types": "attw --pack ."
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

CODE: This is definitely worth knowing about for advanced use cases.

CODE: But our types are working, so no need to overcomplicate things.

FACE: So, our users are desperate to use our package. They're banging down the door, trying to get access to our code. But the types are wrong!

FACE: Help us, they scream! We need a new patch! Oh, alright.

## Versioning

FACE: We need to update our package to fix the types. But we can't just overwrite the code we had before. We need to create a new version and publish that.

CODE: We can run `npm version patch` to bump the patch version.

```bash
npm version patch
```

CODE: This will bump the version from `0.0.1` to `0.0.2`.

CODE: We can then run `npm publish` to publish the new version. Let's double-check everything with `npm run ci`:

```bash
npm run ci && npm publish
```

B-ROLL(npm): And there we go! Our package is now on `npm` with the correct types.

FACE: In my previous video, I used `changesets` to set up a gorgeous publishing workflow with a CI. I still absolutely recommend that, so check out that video for a guide.

FACE: And so, with that, we're done. We've got a beautiful local setup, a package on `npm`, and a workflow ready for CI.

FACE: You can write beautiful TypeScript code, ship it up to `npm`, and have it used by people all over the world. Fame and fortune are sure to follow.

FACE: On a serious note, knowing how to do this is a pretty crucial skill. If you're working for any medium-large company, knowing how `npm` works in-depth is a must.

FACE: Even if you're not publishing your own packages, debugging other people's packages can be a nightmare without this knowledge.

FACE: And if you're looking for more senior-level knowledge, I suggest you check out my

B-ROLL(totaltypescript): TypeScript course. It's got everything you need to know to become a TypeScript wizard.

FACE: Thanks for watching, folks. Check out my previous npm publishing video here, and I'll see you very soon.
