# Are Big Projects Ditching TypeScript?

A recent video by [Fireship](https://www.youtube.com/watch?v=5ChkQKUzDCs), entitled "Big projects are ditching TypeScript... why?" is getting a lot of traction.

So much so, that I'm now regularly getting questions like this:

> What do you think about the mass abandonment of TypeScript by big projects?

I think that Fireship's video contains a number of inaccuracies, and I'd like to address them here.

## Why Did Turbo 8 Drop TypeScript?

The video was released after DHH's announcement that [Turbo 8](https://world.hey.com/dhh/turbo-8-is-dropping-typescript-70165c01) is dropping TypeScript.

Fireship's video got this absolutely right. Turbo 8 has _fully_ dropped TypeScript - from their source code _and_ the compiled output.

DHH reasoned that the source code was [now easier to read](https://github.com/hotwired/turbo/pull/971#issuecomment-1708430006), and that contributors weren't consulted because "this is one of those debates where arguments aren't likely to move anyone's fundamental position". Predictably, the [PR to remove TypeScript](https://github.com/hotwired/turbo/pull/971) from Turbo was _not_ popular with both Turbo's users and contributors.

Fireship's video failed to mention that this means that Turbo's users who _are_ using TypeScript will have a significantly degraded experience. You'll no longer get autocomplete and type safety when using it. Rich Harris, creator of Svelte, memorably called this behavior "[user-hostile dickwaddery](https://twitter.com/Rich_Harris/status/1699490194565578882)".

## Why Did Svelte Drop TypeScript?

The video also mentions that Svelte "no longer uses TypeScript". Then, it goes on to clarify that Svelte is "getting most of the benefits of TypeScript by using JSDoc".

He's right! Svelte is still using TypeScript - just not in the way that most projects do.

To quote [Rich Harris again](https://news.ycombinator.com/item?id=35892250), they are "just moving type declarations from .ts files to .js files with JSDoc annotations". This way, Svelte is able to get the benefits of TypeScript without having to use `.ts` files. This means that "cmd-clicking on functions you import from Svelte [...] will take you to the actual source".

Svelte _still_ has a [`tsconfig.json` file](https://github.com/sveltejs/svelte/blob/effeb7abbac6d46455167b93c3b3767163d98753/packages/svelte/tsconfig.json). It still runs the [TypeScript type checker](https://github.com/sveltejs/svelte/blob/effeb7abbac6d46455167b93c3b3767163d98753/packages/svelte/package.json#L78C13-L78C29).

The only thing they've changed is the way they provide type information to the TypeScript compiler. By all reasonable definitions, they're still using TypeScript.

So, Fireship got this mostly right. But using this example in a video entitled "Big projects are ditching TypeScript" _is_ misleading.

## Why Did Drizzle Drop TypeScript?

This is perhaps the most misleading statement in the video. Drizzle, a popular TypeScript ORM, has not dropped TypeScript.

In the wake of DHH's announcement, Drizzle [tweeted](https://twitter.com/DrizzleORM/status/1699497381824201074) that "we're removing TypeScript from Drizzle". This was a reference, in jest, to DHH's post.

Unfortunately, Fireship took this at face value, and included it in his video as an example of a "big project" dropping TypeScript.

## Conclusions

Are big projects ditching TypeScript?

Turbo dropped TypeScript from their source code and compiled output. Svelte changed from `.ts` files to `.js` files, but is still using TypeScript. Drizzle were joking.

So, no. Big projects are not ditching TypeScript.
