# Evals Explained For Non-Devs

- Intro to evals
- Why AI apps need evals
- Why AI apps are hard to manually QA
- How evals work
- Intro to three types of evals
- Show the `runEval` function example

---

# Evals In The Developer Pipeline

- We'll be looking at exactly how evals fit into the day-to-day life of someone working with AI.
- We'll be looking at how to set up evals, how to run them, and how to debug them.

## How Do I Run Evals?

- Running evals locally
- Evals are slow and expensive, so they should be run separately to unit tests
- Running evals on CI
- Local evals can be run on a subset of data, CI can use all the data
- It's possible to make your evals block your CI if they don't achieve a required score. This may be useful for certain applications - I don't have enough data yet to know if this is a good idea.

## Eval Platforms

- You should be using an eval platform
- Viewing the results of an eval can be complex, so a decent UI can help
- Eval platforms can host your data over time, to track historical improvements. This lets you know if your changes are making things better or worse.
- They also let non-code users inspect the results of an eval. This is indispensable for doing human evaluations, since this gives non-code users a UI to work with.
- My current platform recommendation, based on the production experience of some trusted friends, is [Braintrust](https://www.braintrust.dev/).
- An alternative is Langsmith, but I haven't investigated it as thoroughly.
- I haven't yet found a satisfactory open-source alternative. But If I know the TypeScript community, one must surely be in the works.
- We'll keep touching on why eval platforms are useful in the rest of this article.

## How Do I Debug Slow/Failing Evals?

- The reasons evals fail are often complex. One piece of data may cause a model to behave unpredictably.
- Not only that, but your system is often complex. You're often chaining multiple LLM calls together, and any one of them could be the cause of the failure.
- The best solution is to get your LLM calls to output traces. A trace is a detailed log of what the LLM did:
  - What inputs it received (as a prompt and any other data)
  - What outputs it generated
  - How long it took
- This is another spot where an eval platform really helps. They store the traces for you, and let you inspect them.

## How Do I Observe My LLM App In Production?

- Observing your app in production is especially important for LLM applications.
- Every input your app receives is a valuable piece of data, which can be used to later improve your app.
- Data collected in production can then be piped back into your evals, creating a virtuous cycle of improvement - the Data Flywheel, which we'll look at later.
- Eval platforms help you examine these traces and collect data.

---

# The Data Flywheel

---

# Generating Data With LLM's

---

# Deterministic Evals

# Human Evaluation

# LLM-as-a-Judge Evals

---
