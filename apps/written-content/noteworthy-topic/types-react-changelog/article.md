# Changelog

In recent years, the API surface of `@types/react` has gotten larger than we'd like. This makes working with React and TypeScript unnecessarily tricky. So, we're taking this opportunity to make some small breaking changes to our types, deprecating some and removing others.

We've worked hard to make the migration easier - most can be automated with codemods. Check out the migration guide below for more information.

The runtime changes are far more important since they directly affect the end user of your application. They'll be detailed in React's release notes.

## Try It Out (before React 19.0.0 is released)

The `@types/*` packages don't support pre-releases. Instead, you'll have to alias React types packages to other packages. Modern package managers support this via `resolutions` or `overrides`.

Yarn and PNPM:

```json
{
  "dependencies": {
    "@types/react": "npm:types-react@alpha",
    "@types/react-dom": "npm:types-react-dom@alpha"
  },
  "resolutions": {
    "@types/react": "npm:types-react@alpha",
    "@types/react-dom": "npm:types-react-dom@alpha"
  }
}
```

NPM:

```json
{
  "dependencies": {
    "@types/react": "npm:types-react@alpha",
    "@types/react-dom": "npm:types-react-dom@alpha"
  },
  "overrides": {
    "@types/react": "npm:types-react@alpha",
    "@types/react-dom": "npm:types-react-dom@alpha"
  }
}
```

The following types packages have alphas under different packages:

- `@types/react` -> `types-react`
- `@types/react-dom` -> `types-react-dom`
- `@types/react-is` -> `types-react-is`
- `@types/react-test-renderer` -> `types-react-test-renderer`
- `@types/scheduler` -> `types-scheduler`
- `@types/use-sync-external-store` -> `types-use-sync-external-store`

## Migrating

While we have included some breaking changes, we've put a lot of work into making sure you can codemod your way to fix them.

### Quick Version

```bash
# Add any other React-related @types/* packages you use
npm install -D @types/react@latest @types/react-dom@latest

# Run the codemod
npx types-react-codemod@latest preset-19 ./path-to-your-react-ts-files

# If you have a lot of unsound access to element props,
# you can run this additional codemod:
npx types-react-codemod@latest react-element-default-any-props ./path-to-your-react-ts-files
```

### Full Version

Almost all of the `@types/*` packages are already compatible with React 19 types unless they specifically rely on React 18. Therefore it is advised to **upgrade all React-related `@types/*` packages** first.

Apply the [`preset-19` codemod from `types-react-codemod`](https://github.com/eps1lon/types-react-codemod/#preset-19) in its default configuration via `npx types-react-codemod@latest preset-19 ./path-to-your-react-ts-files`. In our experience, this covers most breaking changes.

The largest block of remaining type issues relate to props of React elements now defaulting to `unknown` instead of `any`. If you're focus is on migration instead of soundness, you can use the [`react-element-default-any-props`](https://github.com/eps1lon/types-react-codemod/#react-element-default-any-props) to resolve a large portion of the breaking changes related to `ReactElement`.

However, the codemod can't cover every pattern. You probably have to manually adjust the lines relying on `any` in `element.props` either by additional runtime checking or manual casts to `any`. You can check out the [example migrations done on libraries e.g. MUI or apps e.g. Bluesky](https://github.com/users/eps1lon/projects/3/views/9) to get an idea of the possible patterns.

## Breaking changes

This section focuses on breaking changes for the React types. Some types have been removed, some type parameters have been changed, and `useRef` has been simplified.

### Removed Types

We've removed these types from `@types/react`. Some of them have been moved to more relevant packages, like `Validator` moving to `PropTypes`. Others are no longer needed to describe React's behavior. Removing them means one less thing to learn.

#### Codemoddable

| Type                    | Codemod                                                                                                                    | Replacement                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `ReactChild`            | [`deprecated-react-child`](https://github.com/eps1lon/types-react-codemod#deprecated-react-child)                          | `React.ReactElement \| number \| string` |
| `ReactFragment`         | [`deprecated-react-fragment`](https://github.com/eps1lon/types-react-codemod#deprecated-react-fragment).                   | `Iterable<React.ReactNode>`              |
| `ReactNodeArray`        | [`deprecated-react-node-array`](https://github.com/eps1lon/types-react-codemod#deprecated-react-node-array).               | `ReadonlyArray<React.ReactNode>`         |
| `ReactText`             | [`deprecated-react-text`](https://github.com/eps1lon/types-react-codemod#deprecated-react-text).                           | `number \| string`                       |
| `Requireable`           | [`deprecated-prop-types-types`](https://github.com/eps1lon/types-react-codemod#deprecated-prop-types-types).               | `Requireable` from `prop-types`          |
| `ValidationMap`         | [`deprecated-prop-types-types`](https://github.com/eps1lon/types-react-codemod#deprecated-prop-types-types).               | `ValidationMap` from `prop-types`        |
| `Validator`             | [`deprecated-prop-types-types`](https://github.com/eps1lon/types-react-codemod#).                                          | `Validator` from `prop-types`            |
| `VoidFunctionComponent` | [`deprecated-void-function-component`](https://github.com/eps1lon/types-react-codemod#deprecated-void-function-component). | `FunctionComponent`                      |
| `VFC`                   | [`deprecated-void-function-component`](https://github.com/eps1lon/types-react-codemod#).                                   | `FC`                                     |
| `WeakValidationMap`     | [`deprecated-prop-types-types`](https://github.com/eps1lon/types-react-codemod#deprecated-prop-types-tpyes).               | `WeakValidationMap` from `prop-types`    |

#### Not Codemoddable

During our [example migrations](https://github.com/users/eps1lon/projects/3/views/9), these types were not used at all.

If you feel a codemod is missing, it can be tracked in the [list of missing React 19 codemods](https://github.com/eps1lon/types-react-codemod/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22React+19%22+label%3Aenhancement).

| Type                    | Replacement                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| `ClassicComponentClass` | `ClassicComponentClass` from `create-react-class`                                                               |
| `ClassicComponent`      | `ClassicComponent` from `create-react-class`                                                                    |
| `ClassicElement<Props>` | `ClassicElement<Props, InstanceType<T>>` from `create-react-class`                                              |
| `ComponentSpec`         | `ComponentSpec` from the `create-react-class` package                                                           |
| `Mixin`                 | `Mixin` from the `create-react-class` package                                                                   |
| `ReactChildren`         | `typeof React.Children`                                                                                         |
| `ReactHTML`             | Either `ReactHTML` from `react-dom-factories` or, if you used `keyof ReactHTML`, use `HTMLElementType` instead. |
| `ReactSVG`              | Either `ReactSVG` from `react-dom-factories` or, if you used `keyof ReactSVG`, use `SVGElementType` instead.    |
| `SFCFactory`            | No replacement                                                                                                  |

### JSX Namespace

A long-time request is to remove the global `JSX` namespace from our types in favour of `React.JSX`. This helps prevent pollution of global types. This change is [codemoddable with `scoped-jsx`](https://github.com/eps1lon/types-react-codemod#scoped-jsx).

This means that if you're doing any module augmentation of `JSX`:

```ts
// global.d.ts

// This adds a new global JSX element
namespace JSX {
  interface IntrinsicElements {
    "my-element": {
      myElementProps: string;
    };
  }
}
```

You'll now need to wrap it in `namespace React`:

```diff
// global.d.ts

+ namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "my-element": {
          myElementProps: string;
        };
      }
    }
+ }
```

### Changes to Type Parameters

#### `useReducer`

`useReducer` now has improved type inference thanks to @mfp22.

However, this required a breaking change where we don't accept the full reducer type as a type parameter but instead either want none (and rely on contextual typing) or want both the state and action type.

The new best practice is _not_ to pass type arguments to `useReducer`.

```diff
-useReducer<React.Reducer<State, Action>>(reducer)
+useReducer(reducer)
```

However, this may not work in edge cases where you can explicitly type the state and action, by passing in the `Action` in a tuple:

```diff
-useReducer<React.Reducer<State, Action>>(reducer)
+useReducer<State, [Action]>(reducer)
```

If you define the reducer inline, we encourage to annotate the function parameters instead:

```diff
-useReducer<React.Reducer<State, Action>>((state, action) => state)
+useReducer((state: State, action: Action) => state)
```

This, of course, is also what you'd also have to do if you move the reducer outside of the `useReducer` call:

```ts
const reducer = (state: State, action: Action) => state;
```

#### `ReactElement`

The `props` of React elements now default to `unknown` instead of `any` if the element is typed as `ReactElement`. This does not affect you if you pass a type argument to `ReactElement`:

```ts
type Example2 = ReactElement<{ id: string }>["props"];
//   ^? { id: string }
```

But if you relied on the default, you now have to handle `unknown`:

```ts
type Example = ReactElement["props"];
//   ^? Before, was 'any', now 'unknown'
```

If you rely on this behavior, use the `react-element-default-any-props` codemod. You should only need it if you have a lot of legacy code relying on unsound access of element props. Element introspection only exists as an escape hatch and you should make it explicit that your props access is unsound via an explicit `any`.

### Component types

Due to the removal of legacy context, forward ref render functions (e.g. `(props: P, ref: Ref<T>) => ReactNode` will now be rejected by TypeScript if used as a component type.

This was almost always a bug that needed fixing by wrapping the render function in `forwardRef` or removing the second `ref` parameter.

### Ref cleanup

React 19 allows returning a "cleanup function" from callback refs.

```tsx
<div
  ref={(_ref) => {
    // Use `_ref`

    return () => {
      // Clean up _ref
    };
  }}
/>
```

This means returning anything else will now be rejected by TypeScript.

The fix is usually to stop using implicit returns e.g.

```diff
-<div ref={current => (instance = current)} />
+<div ref={current => {instance = current}} />
```

The original code returned the instance of the `HTMLDivElement` and TypeScript wouldn't know if this was _supposed_ to be a cleanup function or if you didn't want to return a cleanup function.

You can codemod this pattern with [`no-implicit-ref-callback-return
`](https://github.com/eps1lon/types-react-codemod/#no-implicit-ref-callback-return)

### `propTypes` and `defaultProps` statics

`propTypes` are now ignored by React. However, to ease migration, we just type `propTypes` as `any` to ease migration in case these components are a bridge between typed and untyped components. If we'd remove `propTypes` entirely, a lot of assignments would cause TypeScript issues.

The same does not apply to `defaultProps` on function components since not rejecting them during type-checking would cause actual issues at runtime. Please check out the changelog entry for the removal of `defaultProps` to learn how to migrate off of `defaultProps`.

### Ref changes

A long-time complaint of how TypeScript and React work has been `useRef`. We've changed the types so that `useRef` now requires an argument. This significantly simplifies its type signature. It'll now behave more like `createContext`.

```ts
// @ts-expect-error: Expected 1 argument but saw none
useRef();
// Passes
useRef(undefined);
// @ts-expect-error: Expected 1 argument but saw none
createContext();
// Passes
createContext(undefined);
```

This now also means that all refs are mutable. You'll no longer hit the issue where you can't mutate a ref because you initialised it with `null`:

```ts
const ref = useRef<number>(null);

// Cannot assign to 'current' because it is a read-only property
ref.current = 1;
```

`MutableRef` is now deprecated in favor of a single `RefObject` type which `useRef` will always return:

```ts
interface RefObject<T> {
  current: T
}

declare function useRef<T>: RefObject<T>
```

We still have a convenience overload for `useRef<T>(null)` that automatically returns `RefObject<T | null>`.
To ease migration due to the required argument for `useRef`, we also added a convenience overload for `useRef(undefined)` that automatically returns `RefObject<T | undefined>`.

Check out [[RFC] Make all refs mutable](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/64772) for prior discussions about this change.

### Codemod

When you apply the [`useRef-required-initial` codemod](https://github.com/eps1lon/types-react-codemod#useref-required-initial) (part of `preset-19`), all `useRef()` calls will be converted to `useRef(undefined)`.
