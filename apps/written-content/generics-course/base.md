# ARTICLE: Generic functions are everywhere

Understand how to pass type arguments to generic functions
document.getElementById
Set(), Map()
JSON.parse is not generic, fetch is not generic

# ARTICLE: The “Hello World” of generic functions

Creating functions that receive type arguments
createSet
getElement

# VIDEO: Generic Functions vs Generic Types

Generic Functions can be constrained and defaulted
createSet
With generic types, you MUST pass all type arguments
With generic functions, you can omit all the type arguments
If you do, they default to their defaults, constraint, or unknown if unconstrained
Why is this behavior allowed? We’ll look at that next time.

# ARTICLE: The secret sauce of generics: inference

If a type argument is not provided to a function, it’ll be inferred from the arguments
uniqueArray
retryPromise
If you do pass a type argument, the type argument becomes the source of truth

# ARTICLE: It’s not just functions and types that can be generic…

Generic classes
MapOfArrays<T>

# VIDEO: How do you know when a function should be generic?

Look at a repeated function, draw out the functionality/data that is bespoke per function.
Does the return type of the function depend on the type of the argument?
uniqueArray
If not, does a type in the argument rely on another argument?
modifyArrayMember

# COURSE PREVIEW: Generic React Components

Not interested? Click this link and we’ll skip over this lesson (segments based on React interest)
Table component

# ARTICLE: Don’t let your generic functions lie to you

Re-examine document.getElementById and notice that it’s a hidden assertion

# VIDEO: Generic functions run the world

A brief look at Zod’s generic functions
Combining type transformations with generic functions
toCamelCase
