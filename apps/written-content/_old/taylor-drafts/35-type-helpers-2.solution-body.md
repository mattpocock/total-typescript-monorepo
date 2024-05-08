---
title: Creating an "All or Nothing" Type Helper 
description: An "All or Nothing" type helper simplifies complex logic while allowing for flexible object shapes.
---

We want to make our props behave in an "all or nothing" manner. To do this, we'll create a new type helper called `AllOrNothing` that will take in a parameter `T` and returns that `T` for the time being:

```typescript
type AllOrNothing<T> = T
```

## Testing `AllOrNothing` by Replicating `Input` 

To iteratively write the type helper, we'll start by creating a new type called `Result` that passes the desired props into `AllOrNothing`. 

```typescript
type Result = AllOrNothing<| {
  value: string;
  onChange: ChangeEventHandler;
}>;
```

Since we return `T` in our `AllOrNothing` helper, we'll see `T` showing up in our `Result` type which is what we want. 

But we want to do more than just preserve `T` in our union. It also needs to support an object with undefined values from the second branch of `InputProps`.

How can we add this extra thing into our type? 

## Creating a `ToUndefinedObject` Type Helper

Instead of having the `AllOrNothing` type helper perform a transformation for the empty object, we can create a new type helper called `ToUndefinedObject`.

This new type helper will take in `T` then return a `Record` with `keyof T` and `undefined`:

```typescript
type ToUndefinedObject<T> = Record<keyof T, undefined>
```

So now, inside our `AllOrNothing` helper, we have a union of `T` or `ToUndefinedObject<T>`.

```typescript
type AllOrNothing<T> = T | ToUndefinedObject<T>
```

Our shapes are starting to match, but for the time being the optional properties aren't being preserved:

```typescript
type Example = ToUndefinedObject<| {
  value: string;
  onChange: ChangeEventHandler;
}>;

// hovering over Example
type Example = {
  value: undefined;
  onChange: undefined;
}
```

## Making Properties Optional with `Partial`

The best way to make the values optional is to wrap the `ToUndefinedObject` type helper's `Record` with `Partial`.

The `Partial` is a utility that takes a type `T` and makes all of its properties optional:

```typescript
type ToUndefinedObject<T> = Partial<Record<keyof T, undefined>>
```

With `Partial`, our `Example` type now has `value` and `onChange` as optional properties. 

```typescript
// hovering over Example
type Example = {
  value?: undefined;
  onChange?: undefined;
}
```

## Checking the `AllOrNothing` Type Helper

Now that we've covered both branches of our `AllOrNothing` type helper, we can check with a `Result` type that it works as expected:

```typescript
type AllOrNothing<T> = T | ToUndefinedObject<T>

type ToUndefinedObject<T> = Partial<Record<keyof T, undefined>>

type Result = AllOrNothing<{
  value: string;
  onChange: ChangeEventHandler;
}>

// hovering over Result
type Result = {
  value: string;
  onChange: ChangeEventHandler;
} | Partial<Record<"value" | "onChange", undefined>>
```

Now our `AllOrNothing<T>` type will give us either our original object or an object with all properties set to `undefined`. 

## Update `InputProps` to use the `AllOrNothing` Type Helper

Now that we've created our `AllOrNothing` type helper, we can update our `InputProps` to use it:

Here's the before:
```typescript
export type InputProps = (
  | {
    value: string;
    onChange: ChangeEventHandler;
  }
  | {
    value?: undefined;
    onChange?: undefined;
  }
) & {
  label: string;
};
```

And the after:

```typescript
export type InputProps = AllOrNothing<{
  value: string;
  onChange: ChangeEventHandler;
}> & {
  label: string;
};
```

Our code still works as expected. If you test it out with a "hello" input, you'll notice that it continues to function perfectly.

We've managed to encapsulate our logic into two `AllOrNothing` and `ToUndefinedObject` type helpers that are one line each.

The code is concise and efficient, and works exactly as we want it to!


------


# 35-type-helpers-2.solution

[00:00] Okay, let's give this a go. So let's first define our type helper. We're going to call this type

<img src="./images-35-type-helpers-2.solution/1_00-05520-okay--lets-give-this-a-go-so-lets-first-define-our-type-helper-were-going-to-call-this-type.png" width="720">

 all or nothing, right, and it's going to take in a T. Now this T is going to need to be kind of like

<img src="./images-35-type-helpers-2.solution/2_00-12400-all-or-nothing--right--and-its-going-to-take-in-a-t-now-this-t-is-going-to-need-to-be-kind-of-like.png" width="720">

 the shape of an object but as we'll see it doesn't actually we don't need to worry about that too

<img src="./images-35-type-helpers-2.solution/3_00-17040-the-shape-of-an-object-but-as-well-see-it-doesnt-actually-we-dont-need-to-worry-about-that-too.png" width="720">



[00:17] much. So let's just try by actually just sort of replicating this and passing it in there as an

<img src="./images-35-type-helpers-2.solution/4_00-22880-much-so-lets-just-try-by-actually-just-sort-of-replicating-this-and-passing-it-in-there-as-an.png" width="720">

 example. So let's say type result equals all or nothing and we're actually not going to pass like

<img src="./images-35-type-helpers-2.solution/5_00-30720-example-so-lets-say-type-result-equals-all-or-nothing-and-were-actually-not-going-to-pass-like.png" width="720">

 the entirety of this, right, because this would sort of defeat the purpose. We're actually just

<img src="./images-35-type-helpers-2.solution/6_00-34720-the-entirety-of-this--right--because-this-would-sort-of-defeat-the-purpose-were-actually-just.png" width="720">



[00:34] going to pass in the type of props that we want to turn into an all or nothing. So now we have

<img src="./images-35-type-helpers-2.solution/7_00-41760-going-to-pass-in-the-type-of-props-that-we-want-to-turn-into-an-all-or-nothing-so-now-we-have.png" width="720">

 results and of course this is just an empty object here, right, which is the thing that we're

<img src="./images-35-type-helpers-2.solution/8_00-45760-results-and-of-course-this-is-just-an-empty-object-here--right--which-is-the-thing-that-were.png" width="720">

 returning. If we return T here then we're going to get this showing here. Good. So we want to

<img src="./images-35-type-helpers-2.solution/9_00-51760-returning-if-we-return-t-here-then-were-going-to-get-this-showing-here-good-so-we-want-to.png" width="720">



[00:51] preserve T in our union here, right, but we also want to add another thing here. So like something

<img src="./images-35-type-helpers-2.solution/10_00-58960-preserve-t-in-our-union-here--right--but-we-also-want-to-add-another-thing-here-so-like-something.png" width="720">

 else inside here which is going to be represented by this. So the question is then how do we turn

<img src="./images-35-type-helpers-2.solution/11_01-05280-else-inside-here-which-is-going-to-be-represented-by-this-so-the-question-is-then-how-do-we-turn.png" width="720">



[01:05] this into this? Well one thing you can do is you can use a record type and that record is basically

<img src="./images-35-type-helpers-2.solution/12_01-13680-this-into-this-well-one-thing-you-can-do-is-you-can-use-a-record-type-and-that-record-is-basically.png" width="720">

 going to take T as its input and then turn it into like a... in fact you know what what we could do

<img src="./images-35-type-helpers-2.solution/13_01-20560-going-to-take-t-as-its-input-and-then-turn-it-into-like-a-in-fact-you-know-what-what-we-could-do.png" width="720">



[01:20] is actually turn this into another type helper which is we could go to undefined object here and

<img src="./images-35-type-helpers-2.solution/14_01-27120-is-actually-turn-this-into-another-type-helper-which-is-we-could-go-to-undefined-object-here-and.png" width="720">

 so this to undefined object what it's going to do is it's going to take in a T and then it's going

<img src="./images-35-type-helpers-2.solution/15_01-33040-so-this-to-undefined-object-what-its-going-to-do-is-its-going-to-take-in-a-t-and-then-its-going.png" width="720">

 to do the transform in there and so we're inside here we're going to have T or to undefined object

<img src="./images-35-type-helpers-2.solution/16_01-39280-to-do-the-transform-in-there-and-so-were-inside-here-were-going-to-have-t-or-to-undefined-object.png" width="720">



[01:41] T there. So does that make sense? We've got two branches here. This one is the first one

<img src="./images-35-type-helpers-2.solution/17_01-46080-t-there-so-does-that-make-sense-weve-got-two-branches-here-this-one-is-the-first-one.png" width="720">

 and then this one is the second one and now we need to figure out what the right transform here

<img src="./images-35-type-helpers-2.solution/18_01-50880-and-then-this-one-is-the-second-one-and-now-we-need-to-figure-out-what-the-right-transform-here.png" width="720">

 is to transform this T into this sort of shape. So my solution for this is to use a record type

<img src="./images-35-type-helpers-2.solution/19_01-58560-is-to-transform-this-t-into-this-sort-of-shape-so-my-solution-for-this-is-to-use-a-record-type.png" width="720">



[01:59] and this record type is going to basically it takes in two parameters. It takes in the key

<img src="./images-35-type-helpers-2.solution/20_02-04560-and-this-record-type-is-going-to-basically-it-takes-in-two-parameters-it-takes-in-the-key.png" width="720">

 of the object you want to create and then all of its values. So we can say record key of T

<img src="./images-35-type-helpers-2.solution/21_02-12080-of-the-object-you-want-to-create-and-then-all-of-its-values-so-we-can-say-record-key-of-t.png" width="720">



[02:12] is undefined. Now let's take a look at that. So we can say type to undefined object and let's just

<img src="./images-35-type-helpers-2.solution/22_02-20400-is-undefined-now-lets-take-a-look-at-that-so-we-can-say-type-to-undefined-object-and-lets-just.png" width="720">

 pass in this value and on change here. Let's stick that there and we'll go type example equals to

<img src="./images-35-type-helpers-2.solution/23_02-27680-pass-in-this-value-and-on-change-here-lets-stick-that-there-and-well-go-type-example-equals-to.png" width="720">



[02:27] undefined object. Now what we get here is value undefined and on change undefined. Very nice.

<img src="./images-35-type-helpers-2.solution/24_02-36080-undefined-object-now-what-we-get-here-is-value-undefined-and-on-change-undefined-very-nice.png" width="720">

 So this is starting to look like this one down there but can you see the difference? We've got

<img src="./images-35-type-helpers-2.solution/25_02-41680-so-this-is-starting-to-look-like-this-one-down-there-but-can-you-see-the-difference-weve-got.png" width="720">

 this one here which has the question marks in it, the optional properties, but the optional

<img src="./images-35-type-helpers-2.solution/26_02-47200-this-one-here-which-has-the-question-marks-in-it--the-optional-properties--but-the-optional.png" width="720">



[02:47] properties are not being preserved here. So now this record, which is a record of the keys of T

<img src="./images-35-type-helpers-2.solution/27_02-53760-properties-are-not-being-preserved-here-so-now-this-record--which-is-a-record-of-the-keys-of-t.png" width="720">

 and passing in undefined in the values, we need to somehow make all of those values optional. The best way to do that is by wrapping this with a partial. Now partial takes in

<img src="./images-35-type-helpers-2.solution/28_03-06640-optional-the-best-way-to-do-that-is-by-wrapping-this-with-a-partial-now-partial-takes-in.png" width="720">



[03:07] something, takes in T and makes all of its properties optional. So now example here is

<img src="./images-35-type-helpers-2.solution/29_03-12880-something--takes-in-t-and-makes-all-of-its-properties-optional-so-now-example-here-is.png" width="720">

 value undefined and on change optional property undefined. Beautiful. Super duper nice. So this

<img src="./images-35-type-helpers-2.solution/30_03-21280-value-undefined-and-on-change-optional-property-undefined-beautiful-super-duper-nice-so-this.png" width="720">



[03:21] means now that our all or nothing type helper actually works beautifully because this result

<img src="./images-35-type-helpers-2.solution/31_03-27360-means-now-that-our-all-or-nothing-type-helper-actually-works-beautifully-because-this-result.png" width="720">

 is now value string on change change event handler and we've got this partial record value on change

<img src="./images-35-type-helpers-2.solution/32_03-33120-is-now-value-string-on-change-change-event-handler-and-weve-got-this-partial-record-value-on-change.png" width="720">

 undefined. So it sort of slightly mangles this type output here but we know that if you actually

<img src="./images-35-type-helpers-2.solution/33_03-40160-undefined-so-it-sort-of-slightly-mangles-this-type-output-here-but-we-know-that-if-you-actually.png" width="720">



[03:40] look at the implementation of our all or nothing T we've got T or T to undefined object here.

<img src="./images-35-type-helpers-2.solution/34_03-46480-look-at-the-implementation-of-our-all-or-nothing-t-weve-got-t-or-t-to-undefined-object-here.png" width="720">

 Lovely. Now the last thing to do is just replace this with our all or nothing type helper. So I'm

<img src="./images-35-type-helpers-2.solution/35_03-52640-lovely-now-the-last-thing-to-do-is-just-replace-this-with-our-all-or-nothing-type-helper-so-im.png" width="720">

 going to wrap this in all or nothing. Now I can remove this branch here and I can save it and

<img src="./images-35-type-helpers-2.solution/36_04-00000-going-to-wrap-this-in-all-or-nothing-now-i-can-remove-this-branch-here-and-i-can-save-it-and.png" width="720">



[04:00] prettier actually just removes the parentheses because you don't need them anymore. And now we've

<img src="./images-35-type-helpers-2.solution/37_04-04000-prettier-actually-just-removes-the-parentheses-because-you-dont-need-them-anymore-and-now-weve.png" width="720">

 got all or nothing value string on change change event handler and down here it still works as

<img src="./images-35-type-helpers-2.solution/38_04-09840-got-all-or-nothing-value-string-on-change-change-event-handler-and-down-here-it-still-works-as.png" width="720">

 before. So hello still working still doing exactly what we wanted to. So this is really nice because

<img src="./images-35-type-helpers-2.solution/39_04-16560-before-so-hello-still-working-still-doing-exactly-what-we-wanted-to-so-this-is-really-nice-because.png" width="720">



[04:16] actually there's not a huge amount of complexity here. We've just captured our all or nothing type

<img src="./images-35-type-helpers-2.solution/40_04-21440-actually-theres-not-a-huge-amount-of-complexity-here-weve-just-captured-our-all-or-nothing-type.png" width="720">

 in a one line type helper and two undefined objects still a one line type helper. Super nice.

<img src="./images-35-type-helpers-2.solution/41_04-28160-in-a-one-line-type-helper-and-two-undefined-objects-still-a-one-line-type-helper-super-nice.png" width="720">

