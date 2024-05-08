## Explained: Cannot use JSX unless the '--jsx' flag is provided

This error is likely happening because you haven't specified `jsx` in the `compilerOptions` of your `tsconfig.json`.

```json
{
  "compilerOptions": {
    "jsx": "react"
  }
}
```

This option tells TypeScript that you're using JSX - the syntax that many frontend frameworks use to render elements.

## Which value should I use for `jsx`?

There are several possible values you might need to consider for `jsx`. You can refer to my article solving the ['React refers to a UMD global'](https://www.totaltypescript.com/react-refers-to-a-umd-global) error for more information.

The most likely values to work are:

- `preserve`: preserves the JSX as it is and doesn't add any extra transformations.
- `react-jsx`: uses a modern transform (`_jsx`) that works with React 17 and above.
- `react`: uses a legacy transform (`React.createElement`) that works with React 16 and below.

Try those in order, and see which one works for you.

And if you want to learn React and TypeScript more fully, check out my free [React and TypeScript beginner's course](https://www.totaltypescript.com/tutorials/react-with-typescript). There are 21 interactive exercises packed with TypeScript tips and tricks for React apps.
