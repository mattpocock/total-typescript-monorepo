# Advanced Patterns

The Advanced Patterns workshop is a primer on several patterns that emerge from TypeScript's primitives. We'll build on the generics and type transformations work we've done so far - extracting methods for architecting them into novel solutions.

Most of these patterns aren't documented by TypeScript - they've been discovered and iterated on by the TypeScript community. Each section focuses on a different pattern via interactive exercises.

## Branded Types

Branded types (sometimes known as nominal types) let you break the rules of TypeScript by 'naming' types. This opens up a _lot_ of possibilities for using the type system to ensure your app's logic is robust.

## Globals

The often-feared global scope is a necessary part of most applications. Whether you're importing a library via CDN that attaches to `window`, or relying on environment variables, you'll need to know how to strongly type the global scope.

## Type Predicates & Assertion Functions

Type predicates and assertion functions give you the power to customize TypeScript's control flow. When used in combination with `if` statements, they can help improve inference and make your code easier to reason about.

## The Builder Pattern

This section builds on the Generics work we did in the previous workshop. We'll use classes and generics to perform ridiculous feats of inference - building up entire data structures in TypeScript without a single type annotation from the user.

## External Libraries

Diving into external libraries is extremely complex. But it's often necessary to debug complicated type errors. Understanding the flow of generics through an external library can be critical to quickly fixing red lines. We'll look at several popular libraries.

## Identity Functions

Sometimes in TypeScript, you just need a function. Some generic inference isn't possible without an identity function. We'll learn when and where to use them, as well as some powerful type helpers to assist their inference.
