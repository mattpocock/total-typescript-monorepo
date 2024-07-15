# Is TypeScript Just A Linter?

A common refrain in the web development discourse is that TypeScript is 'just a linter for JavaScript'. It's an oddly multifaceted phrase. It can be used to disdain TypeScript as a 'mere' linter, or to praise it for its simplicity.

I want to give this statement the attention it deserves. Is TypeScript just a linter? No, but yes.

## TypeScript Is Just JavaScript

TypeScript is the most successful attempt ever to create a meta-language for JavaScript. It's JavaScript's tastiest flavour. Milder than CoffeeScript. Sweeter than ClojureScript.

Part of its success is its fidelity to JavaScript. It clings tightly to it. Since enums, TypeScript has added zero new runtime features not already present in JavaScript. Its early attempts to add runtime features are now [falling out of fashion](/books/total-typescript-essentials/typescript-only-features#when-to-prefer-es-vs-ts). These days, TypeScript concerns itself with typing JavaScript.

TypeScript requires far fewer annotations than most typed languages. It can [infer](/books/total-typescript-essentials/essential-types-and-annotations#type-inference) a great deal just by looking at your code. So your JavaScript outputs often look identical to your TypeScript inputs, but with the types stripped out.

Unmask TypeScript, and you'll find JavaScript. The space between them is thin. This is a good thing.

I've been curious about the more refined flavours of JavaScript for a while now. [Elm](https://elm-lang.org/) and [ReScript](https://rescript-lang.org/) especially. But betting company code on these languages feels risky. There are a lot more JavaScript developers than Elm developers. And TypeScript is just a linter for JavaScript.

## Is TypeScript "Strongly Typed"?

But TypeScript is not just a linter for JavaScript. According to its own [landing page](https://www.typescriptlang.org/), is a 'strongly typed programming language'. This assertion feels controversial, and I've seen 'TypeScript is a linter' used in rebuttal. "TypeScript is just JavaScript with some types added, not a language by itself".

TypeScript certainly has some types. Basic types. Object types. Types for the DOM. But there's one type that calls the rest into question: [`any`](https://www.totaltypescript.com/books/total-typescript-essentials/essential-types-and-annotations#the-any-type).

`any` breaks the rules. It's a nuclear warhead against rock, paper, scissors. It can infect a codebase, metastasizing from a single function. Its mere presence in the language means, in my eyes, TypeScript cannot be considered 'strongly typed'. There are no guarantees. The center cannot hold.

`any` has to exist. If it didn't, TypeScript would be burdened with the challenge of describing the entirity of JavaScript in types. `any` is a pressure valve. It makes TypeScript simpler and leaner. I'm glad it exists.

But `any` is a virus that remakes its host. TypeScript's types are at best advisory. Guidelines, not rules. You can disable its checking at any time. TypeScript is just a linter for JavaScript.

## TypeScript Is Just A Linter

Let's state the obvious. TypeScript is not just a linter. It's an astonishingly advanced type system. It's a compiler. It's a language server that can run on any compatible IDE.

But thinking of it _like_ a linter is useful. Its type system lives to serve JavaScript. It's easy to adopt. It's easy to eject from. If you don't understand it, shut it up and move on.

And embrace it. You're not a TypeScript dev. You're a JavaScript dev. `typeof NaN` is a number and `typeof null` is an object. You'll get more out of TypeScript as a result.
