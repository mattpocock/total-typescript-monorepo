---
title: DRY out Code with Generic Type Helpers

description: Generics and type helpers combine to create reusable code that's easy to understand and maintain. 
---


# Autocomplete Type Refactoring in TypeScript

In this exercise, we're going to revisit the loose autocomplete type concept we've seen before.

Here, we have a `LooseIcon` type, which is either an `Icon` or string and an empty object.

This setup provides us with autocomplete for `home`, `settings`, and `about` inside these icons. The same applies to button variants: `primary`, `secondary`, `tertiary`. 

```typescript
type Icon = "home" | "settings" | "about";
type ButtonVariant = "primary" | "secondary" | "tertiary";

// How do we refactor this to make it DRY?
type LooseIcon = Icon | (string & {});
type LooseButtonVariant = ButtonVariant | (string & {});
```

So far, so good. But there's room for improvement.

We want to refactor this code to make it more DRY (Don't Repeat Yourself) and to clarify what's happening. After all, someone new to the code might find the current setup confusing.

```typescript
export const icons: LooseIcon[] = [
  "home",
  "settings",
  "about",
  "any-other-string",
  // I should get autocomplete if I add a new item here!
];

export const buttonVariants: LooseButtonVariant[] = [
  "primary",
  "secondary",
  "tertiary"
];
```

## Challenge

Your task is to wrap the icon and button variants in a new type helper that makes use of generics. You'll know it's working correctly when you get autocomplete on new items that are added.

Here are some resources to check out for help:

* [Type Helpers on totaltypescript.com](https://www.totaltypescript.com/concepts/type-helpers)
* [Type Helpers from the Type Transformations Workshop](https://www.totaltypescript.com/workshops/type-transformations/type-helpers/introducing-type-helpers)
* [Generics in the TypeScript Docs](https://www.typescriptlang.org/docs/handbook/2/generics.html)





------


# 34-type-helpers.problem

[00:00] In this exercise, we're going to revisit something that we've seen before,

<img src="./images-34-type-helpers.problem/1_00-03280-in-this-exercise--were-going-to-revisit-something-that-weve-seen-before-.png" width="720">

 which is this loose autocomplete type here,

<img src="./images-34-type-helpers.problem/2_00-05760-which-is-this-loose-autocomplete-type-here-.png" width="720">

 where we have a loose icon type,

<img src="./images-34-type-helpers.problem/3_00-08160-where-we-have-a-loose-icon-type-.png" width="720">

 which is the icon or string and empty object. The result of this is that we get autocomplete for

<img src="./images-34-type-helpers.problem/4_00-14800-the-result-of-this-is-that-we-get-autocomplete-for.png" width="720">

 about home and settings inside these icons here.

<img src="./images-34-type-helpers.problem/5_00-18080-about-home-and-settings-inside-these-icons-here.png" width="720">

 The same is true for these button variants too,

<img src="./images-34-type-helpers.problem/6_00-19880-the-same-is-true-for-these-button-variants-too-.png" width="720">



[00:19] we get primary, secondary, tertiary. So everything's working, everything's all fine, except we want to refactor this so that it's a little bit more dry,

<img src="./images-34-type-helpers.problem/7_00-28520-except-we-want-to-refactor-this-so-that-its-a-little-bit-more-dry-.png" width="720">

 and so it's a little bit more obvious what's happening, because someone stumbling upon this code might look at this and go,

<img src="./images-34-type-helpers.problem/8_00-34120-because-someone-stumbling-upon-this-code-might-look-at-this-and-go-.png" width="720">

 what on earth is happening here?

<img src="./images-34-type-helpers.problem/9_00-35720-what-on-earth-is-happening-here.png" width="720">

 This looks terrifying to me.

<img src="./images-34-type-helpers.problem/10_00-37560-this-looks-terrifying-to-me.png" width="720">



[00:37] So ideally, we would find a way to extract out this logic

<img src="./images-34-type-helpers.problem/11_00-42920-so-ideally--we-would-find-a-way-to-extract-out-this-logic.png" width="720">

 into some type function.

<img src="./images-34-type-helpers.problem/12_00-45160-into-some-type-function.png" width="720">

 I'm going to link some resources below on type helpers,

<img src="./images-34-type-helpers.problem/13_00-49480-im-going-to-link-some-resources-below-on-type-helpers-.png" width="720">

 because this is the primary thing we're looking at here.

<img src="./images-34-type-helpers.problem/14_00-52040-because-this-is-the-primary-thing-were-looking-at-here.png" width="720">

 What I'd like you to do is I'd like you to

<img src="./images-34-type-helpers.problem/15_00-55320-what-id-like-you-to-do-is-id-like-you-to.png" width="720">

 wrap icon and button variants in a new type helper,

[00:59] define that type helper,

<img src="./images-34-type-helpers.problem/16_01-00680-define-that-type-helper-.png" width="720">

 and use it to sort of capture this behavior inside it.

<img src="./images-34-type-helpers.problem/17_01-04600-and-use-it-to-sort-of-capture-this-behavior-inside-it.png" width="720">

 So there we go.

<img src="./images-34-type-helpers.problem/18_01-05400-so-there-we-go.png" width="720">

 I've given you, I think, enough for you to get started, and make sure you dive into the TypeScript docs for this,

<img src="./images-34-type-helpers.problem/19_01-10760-and-make-sure-you-dive-into-the-typescript-docs-for-this-.png" width="720">

 and check out generics and generic types. Good luck.

<img src="./images-34-type-helpers.problem/20_01-14680-good-luck.png" width="720">

