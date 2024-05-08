> Cannot redeclare block-scoped variable 'name'.

This error is likely occurring because you have two variables with the same name, or you might have tried to modify something in the global scope.

There are a few main solutions, based on the type of problem you're having:

## Solution 1: Rename the variable

If you have two variables with the same name in the same scope, it'll cause this error:

```ts twoslash
// @errors: 2451
let id = 123;

let id = 456;
```

This is because when a variable is declared, its value is saved in memory. If you try to declare another variable with the same name in the same scope, it'll try to save it in the same place, which will cause an error.

So, the simplest fix is to rename one of the variables.

## Solution 2: Change the scope

If you want to retain the same name, you can change the scope of one of the variables:

```ts twoslash
let id = 123;

{
  let id = 456;

  console.log(id); // 456
}

console.log(id); // 123
```

This works because the two variables are in different scopes. The first `id` is in the scope of the module, and the second `id` is in the scope of the block.

But, as you can see, this can be confusing for folks reading your code - you should avoid naming variables the same thing in different scopes.

## Solution 3: Your module isn't a module!

If you _don't_ have two variables with the same name, it's possible that you've accidentally tried modifying the global scope.

Let's take a look at this classic error:

> Cannot redeclare block-scoped variable 'name'.

```ts twoslash
// @errors: 2451
const name = "Matt";
```

We've only got one `name` in our file, so what's going on?

This is happening for two reasons. First, our file doesn't have any imports or exports in it. If we add an empty export, the error goes away:

```ts twoslash
const name = "Matt";

export {};
```

When TypeScript doesn't see an import or export, it considers the file to be a script, not a module.

Scripts are loaded into the global scope of browsers via the `<script />` tag - so any code we write here is at the _same_ scope as globals like `window` and `document`.

And, as it turns out, `name` is one of these global variables. So, when we try to declare a variable with the same name, TypeScript throws an error.

#### Setting `moduleDetection` to `force`

If you're in a project where every file is a module, not a script, you should change `moduleDetection` to `force` in your `tsconfig.json`.

This will make TypeScript treat every file as a module, even if it doesn't have any imports or exports.

```json
{
  "compilerOptions": {
    "moduleDetection": "force"
  }
}
```

Long-term, this is the best way to avoid this error.
