# 3 incredible things you can do with TypeScript (and 1 you probably shouldn't)

I love TypeScript for its community. They're generous, curious, and fiercely inventive.

And, of course, because it's absurdly powerful. TypeScript's type system is [Turing Complete](https://github.com/microsoft/TypeScript/issues/14833). In other words, you can use it to run any algorithm. And a few [preoccupied scientists](https://www.youtube.com/watch?v=_oNgyUAEv0Q) are stretching TypeScript to its limits.

[**MistCSS**](https://github.com/typicode/mistcss) is a bonkers take on creating custom components in TypeScript apps. It does something I've never seen before - generating TypeScript code from CSS.

You write some CSS, with some `data-*` attributes specified:

```css
button {
  &[data-variant="primary"] {
    background-color: black;
  }

  &[data-variant="secondary"] {
    background-color: grey;
  }
}
```

Then, you can write some JSX, with a `data-variant` property - and the `data-variant` is strongly typed:

```tsx
<>
  <button data-variant="primary">Save</button>
  <button data-variant="secondary">Save</button>

  <button data-variant="tertiary">Save</button>
  {/*                   ^^^^^^^^ Error! */}
</>
```

It works by generating some types in the [global scope](https://www.totaltypescript.com/books/total-typescript-essentials/modules-scripts-and-declaration-files) which influences the [props of the JSX Elements](https://www.totaltypescript.com/what-is-jsx-intrinsicelements) available:

```ts
declare namespace JSX {
  interface IntrinsicElements {
    button: CustomButtonProps; // MistCSS-generated type
  }
}
```

So you write some CSS, and you get a strongly-typed component out of it. I think I'll be sticking to [Tailwind](https://tailwindcss.com/) - but the idea is fascinating.

Next up is **`gql.tada`**. GraphQL and TypeScript typically have a fraught relationship. You query GraphQL endpoints with strings:

```ts
const query = `
  query {
    user {
      id
      name
    }
  }
`;

const result = await fetchFromGraphQLEndpoint(query);
//    ^ How do type this?
```

`result` here can't usually be strongly typed. You can't know that it's returning a `user` object with an `id` and a `name`.

It's common to patch over this with [codegen](https://the-guild.dev/graphql/codegen), which works [well enough](https://www.youtube.com/watch?v=5weFyMoBGN4).

But [`gql.tada`](https://gql-tada.0no.co/get-started/) takes a different approach. They have written a GraphQL string parser in TypeScript. You wrap your queries in a function call, and boom:

```ts
import { graphql } from "gql.tada";

const query = graphql(`
  query {
    user {
      id
      name
    }
  }
`);

const result = await fetchFromGraphQLEndpoint(query);
//    ^ Typed as { id: string; name: string }
```

How is it doing this? The magic of [template literal types](https://www.totaltypescript.com/books/total-typescript-essentials/designing-your-types-in-typescript#template-literal-types-in-typescript). TypeScript's type system is reading the string passed in, and inferring the type of the result.

It's incredible, and surprisingly fast. If I were starting a GraphQL project today, this is how I'd query it.

The last is the maddest. [`zack_overflow`](https://x.com/zack_overflow) built [**Flappy Bird** in TypeScript's type system](https://zackoverflow.dev/writing/flappy-bird-in-type-level-typescript/).

![alt text](image.png)

Yes, you can [play it](https://tyvm.100x.software/). And yes, it's written only in TypeScript types.

He got this working by creating a custom type-level TypeScript runtime, written in [Zig](https://ziglang.org/), that can run TypeScript types as if they were runtime code.

The code to draw the pipes? A [generic type](https://www.totaltypescript.com/books/total-typescript-essentials/designing-your-types-in-typescript#generic-types). The code to check collisions? A generic type. Every piece of runtime code you'd usually capture in a function is now a type.

Is it wise to write Flappy Bird in the type system? No. But the fact it's possible is mind-expanding.

To put it mildly, TypeScript's type system has very few limits. You can tweak global types for better autocomplete. You can solve old problems in new ways. And even use the type system to drive a freaking game engine.

If you've got some time this week, check out the code for these projects. It's a wild ride, but they're full of useful ideas you can study and repurpose for your own projects. And if you're feeling brave, reverse-engineering is a great way to learn.

If you're hungry for more, the other great way to learn this is by _doing_. My TypeScript course, [Total TypeScript](https://www.totaltypescript.com/), is all about action. There are over 400 carefully crafted coding challenges, on every topic from the basics of objects, functions and narrowing to advanced magic like generics, type transformations and advanced patterns.

I designed every challenge to be _just hard enough_ to be fun and exciting, and narrow enough in scope to be done quickly. You can knock out a couple before a meeting or on your lunch break.

TT is perfect for absolute beginners, all the way up to advanced TS devs. And even wizards will learn new tricks and deepen your understanding.

If you've been thinking about leveling up your TypeScript skills in 2025, now's the time.

When you enroll, you'll get access to 5 workshops and 400+ challenges for $500. On December 19th, we're putting the price back to where it was in the first half of 2024 - $790.

Check out the [full course list](https://www.totaltypescript.com/workshops) for Total TypeScript Complete.

And [click here](https://totaltypescript.com) if you're ready to enroll and save 35%!
