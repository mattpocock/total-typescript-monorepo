# Evals Explained For Non-Devs

- Intro to evals
- Why AI apps need evals
- Why AI apps are hard to manually QA
- How evals work
- Intro to three types of evals
- Show the `runEval` function example

---

# Evals In The Developer Pipeline

## How Do I Run Evals?

- Running evals locally
- Running evals on CI
- Local evals can be run on a subset of data, CI can use all the data
- Evals are slow and expensive, so they should be run separately to unit tests

## Eval Platforms

- You should be using an eval platform
- Viewing the results of an eval can be complex, so a decent UI can help
- Eval platforms can host your data over time, to track historical improvements
- My current recommendation, based on the production experience of some trusted friends, is [Braintrust](https://www.braintrust.dev/).
- An alternative is Langsmith, but I haven't investigated it as thoroughly.
- I haven't yet found a satisfactory open-source alternative. But If I know the TypeScript community, one must surely be in the works.

## How Do I Debug Failing Evals?

---

# Deterministic Evals

# Human Evaluation

# LLM-as-a-Judge Evals

---
