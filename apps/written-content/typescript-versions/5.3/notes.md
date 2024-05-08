TypeScript 5.3 First Look

Let's take a look at some features that might be coming to TS 5.3.

I wrote a 1,300 word article on TT (linked below), but here's the TL;DR:

Import Attributes

This TC39 proposal lets you specify and validate the exact type of imports.

This is useful for security - there's no guarantee that `./foo.json` will actually be a JSON file, and might execute code.

Throw Expressions

You might be surprised that the code below doesn't work:

That's because throwing something doesn't count as an expression.

This proposal is still at Stage 1, so it's unlikely to land in 5.3 - but the TS team will likely spend time championing the proposal and moving it through the TC39 gears.

Isolated Declarations

This new tsconfig.json option aims to speed up type checking in monorepos. By forcing you to be more explicit with some annotations, you'll be able to radically speed up your type checking.

Improvements to Narrowing in Generic Functions

Currently, the way generic functions narrow values can be extremely strange:

TypeScript 5.3 might ship some improvements here. I'm really excited that this might make generic functions more approachable and powerful.
