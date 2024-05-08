Here goes:

It introduces a new symbol called [Symbol.dispose].

Like [Symbol.iterator] lets you iterate over things, [Symbol.dispose] lets you _use_ things via the new 'using' keyword.

When you 'use' something, like 'using resource' below, you're saying that you want the [Symbol.dispose] function to be called when that variable leaves the current scope.

---

```typescript
{
  const getResource = () => {
	  return {
      [Symbol.dispose]: () => {
        console.log('Hooray!')
      }
    }
  }

  using resource = getResource();
} // 'Hooray!' logged to console
```

---

https://twitter.com/oriSomething/status/1669628514092425217

I have mixed feelings about this proposal. It might save some code, but I don't think enough so it worth introducing more complexity to the language

---

TypeScript 5.2 will introduce a new keyword - 'using', that you can use to dispose anything with a [Symbol.dispose] function when it leaves scope.

---

```ts twoslash

```
