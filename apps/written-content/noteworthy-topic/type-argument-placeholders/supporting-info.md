preferinfer maybe a possibility?

https://github.com/microsoft/TypeScript/issues/53999

Wes Wigham:

Not at present, I think we'd want to ship without that for a bit, and see if the papercut of writing new F<A,_,_>() instead of F<A>() is actually a big enough difference to warrant it.

Phryneas:

Please reconsider this. This could make some apis in Redux Toolkit a lot simpler, but only if we don't have to push that burden onto our users.

We have many apis where some type arguments always have to be inferred - manually specifying the input here could sometimes be hundreds of lines long, so it wouldn't make sense to "expose" these generic arguments to the user, ever.

David Blass:

Echoing some of the sentiments that have already been expressed, this doesn't seem like a big deal for library authors, but putting the onus on a user to correctly leverage this feature drastically reduces the benefit, much more so than a "papercut" would imply.

I'm all for marginal improvements, so if allowing unprovided parameters to default is too significant in scope to accommodate in this release, I definitely still appreciate the incremental progress. That said, at present the feature won't really feel "complete" to me until it allows parameters to be omitted.

RyanCavanaugh:

For context, the reason we are leaning toward an explicit inference argument is that many functions out there are overloaded on generic arity, and type argument arity is one of the first things overload selection looks for. So it is likely a massively breaking change to opt this behavior in by default because many overloaded functions would likely start resolving to a different signature, and it's not exactly clear how we would even select which signature to do inference on in the first place.

Andarist:

But the current comments aren't really about enabling partial inference by default. We are mainly asking you to reconsider an opt-in way to enable partial inference somehow for opted-in signatures (however that would look like syntactically etc).

https://github.com/microsoft/TypeScript/issues/54228

RyanCavanaugh:

> I suspect this is exactly the reason for the caution here - if said incremental progress involves a new feature, then the way to use that feature now has to then be maintained for backward compatibility even if a different, better way comes along later

I would just echo this 100 times over, because the entire reason we're in a difficult spot here in the first place is that generic defaults were sort of rushed in, when we should have really done partial inference for unspecified type parameters instead. it's significantly easier to do the right version of a feature first than to do the OK version and then a better version later.

---

```ts twoslash
const makeSelectors = <
  TSource,
  TSelectors extends Record<
    string,
    (source: TSource) => any
  >
>(
  selectors: TSelectors
) => {
  return selectors;
};
```

This takes two type arguments - `TSource` and `TSelectors`. `TSource` is the thing we're selecting from, and `TSelectors` is an object of functions that take a `TSource` and return something.

If we pass in a single type argument, TypeScript will yell at us for not passing in the second type argument:

```ts twoslash
// @errors: 2558 2339
const makeSelectors = <
  TSource,
  TSelectors extends Record<
    string,
    (source: TSource) => any
  >
>(
  selectors: TSelectors
) => {
  return selectors;
};

// ---cut---
const selectors = makeSelectors<{ id: number }>({
  id: (source) => source.id,
});
```

But if we _do_ pass in a second type argument, we end up a LOT of duplicated code:

```ts twoslash
const makeSelectors = <
  TSource,
  TSelectors extends Record<
    string,
    (source: TSource) => any
  >
>(
  selectors: TSelectors
) => {
  return selectors;
};

// ---cut---

const selectors = makeSelectors<
  { id: number },
  // We have to type TSelectors manually!
  {
    id: (source: { id: number }) => number;
  }
>({
  id: (source) => source.id,
});
```

This behaviour was actually never intended from the TypeScript team.
