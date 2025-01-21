Something very, very important has happened in the TypeScript and Node world.

Something so important that it's pulled me out of developing my TypeScript and AI course.

That's right - I'm working on an AI engineer course called AI Hero. There'll be in the link below in the description. It's going to be absolutely sick. But that's not important right now.

What is important is that `Node` finally supports TypeScript with zero extra configuration.

This is thanks to the awesome volunteer work from Marco Ipolito and the rest of the volunteers that make up the Node.js team.

Yes, it's still experimental. It has limitations, and it's subject to change.

Boo. Show me the code. Alright, I will.

As it currently stands, `Node` cannot run TypeScript files out of the box.

I've created a TypeScript file with a type annotation `message: string`:

```ts twoslash
const message: string = "Hello, World!";

console.log(message);
```

I'm on the latest version of `Node 22` here. If I try to run this, I'm going to get an error:

```bash
node entry.ts

Unknown file extension ".ts" for /home/mattpocock/repos/ts/total-typescript-monorepo/apps/written-content/articles/node-shipped-ts-support/entry.ts
```

I can get this working with `Node 22` by adding an extra flag: `--experimental-strip-types`:

```bash
node --experimental-strip-types entry.ts
(node:592128) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Hello, World!
```

This uses a cut down version of swc to strip out the types and then run the resulting javascript.

What they've done is, in no 23 they have unflagged this feature. So you can run a typescript file without any extra flag, any extra configuration.

Let's grab the latest version of Node 23. For now, that's `23.6.0`.

If you're not using nvm, use nvm, and then Download the latest version of twenty three.

```bash
nvm install 23 --latest
```

Let's check with node version:

```bash
node --version
v23.6.0
```

And now I can run the typescript file without any extra flags:

```bash
node entry.ts
Hello, World!
```

And there we go. It has happened.

You probably have a lot of technical follow up questions.

- Does it type cheque your files?
- What should my TS Config look like?
- Does it support enums and namespaces?
- Will it come to previous versions of node?

I can't update this youtube video in real time, So I'm keeping an up to date article, which is in the description below.

It currently has answers to all of those questions and anymore that might come in this comment section.

So go there if you want any answers to any questions.

But I want to talk for a second about what this means for node.

This is a huge step forward for the node ecosystem.

A lot of folks on youtube talk about bun and Dino being node killers.

It's a very attractive way to title a youtube video for sure.

But the reality is that the more horses run in the race, the faster they all run.

Node is the incumbent. Is the most popular server runtime for javascript. And it's run by a team of volunteers.

Note we'll move slower than Dino and Bunn, because they don't have people working on it full time.

The only folks who do work on node part time time, like Joyee Chung, are sponsored by companies.

And having sponsors siloed off in different parts of the world is fundamentally different to having a crew of people in San Francisco burning out code.

So yeah, node is an oil tanker. It's slow to turn, but it is turning.

And shipping timescript support is one of the big differentiators between Dino Bun and node. And they did it. Hats off to them.

So that's it. That's the big news. I'm going to go back to working on my AI course, go under my rock if you want to see what I'm doing. It's an AI hero dev.

But if you just want a really amazing typescript course, go to total typescript com.

Thanks so much for joining along and I'll see you in the next one.
