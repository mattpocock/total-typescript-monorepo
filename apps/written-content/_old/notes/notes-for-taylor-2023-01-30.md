# Art of Generics

https://www.totaltypescript.com/workshops/typescript-generics/advanced-generics/combing-type-arguments-and-conditional-types

Title: Generics with Conditional Types

https://www.totaltypescript.com/workshops/typescript-generics/advanced-generics/inference-inside-generic-functions/solution

Title: Fixing Errors in Generic Functions

https://www.totaltypescript.com/workshops/typescript-generics/advanced-generics/generic-function-currying

Update this section:

Your challenge is to update `curryFunction` so that inference works for every function passed in.

To:

Your challenge is to update `curryFunction` so that inference works for every argument passed in.

https://www.totaltypescript.com/workshops/typescript-generics/advanced-generics/generic-function-currying/solution

Update this section:

This means that they can't be inferred because they are always attached to the function call.

In order to fix this, we have to move the type arguments onto the function call itself:

To:

This means that they can't be inferred because they are always attached to the first function call.

In order to fix this, we have to spread out each type argument across different function calls:

https://www.totaltypescript.com/workshops/typescript-generics/advanced-generics/generic-interfaces-with-functions/solution

Update:

However, this isn't the place to do it because we would then have to define it when we create the cache and have to say what it would transform into later.

To:

However, this isn't the place to do it. We would then have to define it when we _create_ the cache instead of when we clone it.

https://www.totaltypescript.com/workshops/typescript-generics/advanced-generics/spotting-missing-generics/solution

Update:

Make sure that the types you use can do what they're suppoed to do and have all of the information they need to operate correctly.

To:

Make sure that the types you use can do what they're supposed to do and have all of the information they need to operate correctly.
