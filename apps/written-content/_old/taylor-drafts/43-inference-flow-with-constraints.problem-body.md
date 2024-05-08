---
title: 

description: 


// DELETE THE BELOW WHEN DONE


Possible Titles:
  1. Advanced Hook Techniques: Exploring useMutation
  2. Enhancing Mutations with Generic Hooks
  3. Implementing Type Safety in useMutation for Better Error Handling

Possible Descriptions:
  1. Dive deep into useMutation, a complex hook that allows for flexible mutation handling in your application. Learn how to properly define mutations and handle loading states with this advanced hook technique.
  2. Discover how to optimize your code by making use of generic hooks and type constraints in useMutation. This workshop will guide you through capturing type arguments and improving the overall flow of your application.
  3. Boost the reliability and maintainability of your code by implementing type safety in useMutation. Explore techniques for handling errors and ensuring that only the right arguments are passed to mutations, leading to a more robust application.


---

Consider this complex `useMutation` hook that allows us to pass any mutation into its `opts`, then returns a `mutate` function.

```typescript
export const useMutation = (opts: UseMutationOptions): UseMutationReturn => {
  const [isLoading, setIsLoading] = useState(false);

  return {
    mutate: async (...args) => {
      setIsLoading(true);

      try {
        const result = await opts.mutation(...args);
        return result;
      } catch (e) {
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    isLoading,
  };
};
```

Let's look at an example that uses a `createUser` mutation that comes from a fake external library:

```typescript
// inside fake-external-lib/index.ts

export const createUser = (
  user: {
    name: string;
    email: string;
  },
  opts?: {
    throwOnError?: boolean;
  },
): Promise<{
  id: string;
  name: string;
  email: string;
}> => {
  return fetch("/user", {
    method: "POST",
    body: JSON.stringify(user),
  }).then((response) => response.json());
};
```

We can see that it accepts `user`, `name`, `email`, and a second parameter, `options`. These `options` can be used to throw an error or not. The return is a promise with `id`, `name`, and `email` that correspond to the user we've just created.

Although this function is a mock and doesn't perform any real operations, it will help us infer the types for our `useMutation` hook.

Here's how we would call `useMutation`: 

```typescript
const mutation = useMutation({
  mutation: createUser,
});
```

Currently there are some errors.

The call to `mutation.mutate` doesn't throw an error when the `user` object has missing values, and we can pass extra arguments to `mutation.mutate` that are not needed.


## Challenge

The `useMutation` hook needs to be updated to become a generic function.

Also, the `any`s inside of the `Mutation` type need to be dealt with:

```typescript
type Mutation = (...args: any[]) => Promise<any>;
```

Your challenge is to find the correct expression for those type arguments to make all of the errors go away.