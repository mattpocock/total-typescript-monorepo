# Evals Explained For Non-AI Devs

How do you know if your AI application is hallucinating? How do you ensure it's outputting what you want it to? How do you ensure it stays secure? How do you test it against different models?

The answer is evals. Evals are the AI developer's unit tests. They are how you wrangle predictability from a probabilistic system. They are an indispensible part of productionizing any AI app. I'd argue that your AI app is only ever as good as its evals.

Let's break down what evals are, and why AI apps need them so badly.

## In AI Apps, No Change Is Small

All AI systems are subject to the butterfly effect. Tiny changes in a prompt, user input or the underlying model can result in enormous deltas in output.

Normal software is deterministic. The relationship between the inputs (the code) and the outputs (the behavior of the software) is often straightforward. Each part of the codebase has its own domain of responsibility.

![alt text](image-4.png)

Let's say you capitalize a single word in an app menu. You can be fairly confident in the outcome of that change. The dependencies between your code and its output are clear.

But capitalizing a single word in a prompt can create massive ripple effects.

The dependencies in an AI system are totally inscrutable. Every input is fed into a black box, which only then produces an output.

![alt text](image-5.png)

In AI systems, no change is small. Their attention and transformation mechanisms are inscrutable. Whether the butterfly "flaps" or "Flaps" its wings may change the output. To put it mildly, building robust systems with them requires care.

## "Vibes-only" Is A Killer

It's easy to get an impressive AI demo working quickly. You try a prompt. You add some exemplars of your desired output. You pull in some chain-of-thought. It clicks, and your system starts working. You've produced a tool of genuine value.

Time to get it into production. QA takes a hatchet to your system, and finds several bugs. You push a commit to fix the bugs. But the bugfix produces other bugs. Each commit seems to make the system worse.

Perhaps the problem is the model. You switch from GPT-4o to Claude. Your output improves. The vibes are good. But new bugs appear. Perhaps the system makes its way into production. 6 months down the line, the app becomes unusably buggy. The underlying model changed, and you didn't know until your users told you.

A "Manual QA-only" approach in deterministic software is usually doable. You say "I added a new page" and the QA team can rigorously test the new page, and smoke test the previous pages.

But in probabilistic systems, it is a killer. When any change can affect the entire system, how do you make progress?

## Evals: Testing Non-Deterministic Systems

The key is automation. We need to evaluate our app every time we make a change, or every time the underlying model changes.

In deterministic systems, automating testing is relatively straightforward. You can feed some inputs in and check the outputs.

```ts
const output = myNormalSystem(input);

// Will fail if the output doesn't match
assert(output === "my-desired-output");
```

These assertions are 'pass' or 'fail'. And usually, an app has to pass every test to be considered production-ready. But writing these tests for AI isn't as straightforward.

Let's say your app generates written articles. You want to check that the output is good enough for production. Some assertions are easy to write:

```ts
const article = writeArticle(prompt);

// Article should be more than 300 words long
assert(article.length >= 300);

// Article should be less than 2,000 words long
assert(article.length <= 2000);
```

But how would you write assertions for:

- **Factuality**: checking if all statements in the output are factually correct
- **Writing style**: ensuring that the text is elegant and well-written
- **Prompt fidelity**: ensuring that the output actually corresponds to what the user asked.

These are qualitative metrics. Instead of a pass/fail, they need to be represented by a _score_. Each time you change your app, you need to know if it made the system 5% better, or 50% worse.

This is what evals do - they give you a score you can use to see how well your AI system is performing.

## Three Types Of Evals

Evals come in many shapes and sizes. We saw **deterministic evals** before:

```ts
const article = writeArticle(prompt);

// Article should be more than 300 words long
assert(article.length >= 300);

// Article should be less than 2,000 words long
assert(article.length <= 2000);
```

These are traditional pass/fail checks. You would pass a wide variety of prompts into your system, and check each time if they pass these tests.

They're simple to write, but only cover a subset of what you want to evaluate.

Another technique is to pass the results of your prompts into another LLM, and use that **LLM as a judge**. This can give you a barometer on things like writing style, and how well the response matches the query.

Finally, you can use **human evaluation**, using manual QA. Most systems will need at least a bit of this - but it's also slow.

In this series, we'll cover each one of these techniques in-depth.

## The Full Picture

Imagine an eval kind of like a function:

```ts
const score = runEval({
  // 1. The prompts we'll test with
  data: [
    "Fish species in the Mediterranean",
    "Story of the first Moon landing",
    "Are Krakens real?",
  ],
  // 2. A function to generate outputs based
  // on our prompts
  task: async (topic) => {
    return generateArticle(topic);
  },
  // 3. The scorers we'll use to generate
  // the final score
  scorers: [
    // Checks if output is long enough
    length,
    // Uses an LLM to check if it's accurate
    factualAccuracy,
    // Uses an LLM to check writing style
    writingStyle,
  ],
});

// 4. A score between 0-100%
console.log(score);
```

We pass in a set of prompts (1), then the task to run (2), then the methods we're using to score our output (3).

Finally, we get back a score on how well our function performed (4).

This, at its heart, is what an eval is. This API is loosely inspired by Braintrust's [autoevals library](https://github.com/braintrustdata/autoevals).

## Your App Is Only As Good As Its Evals

So, to summarize:

- AI programs are incredibly sensitive to small changes.
- Continuous monitoring is required to know whether your app is getting better or worse.
- To run an eval, you take a `task`, pass it some `data`, and check the outputs using `scorers`. This generates a score between 0 and 100.
- You can run these evals after every change, or to evaluate new models, to get a qualitative metric on your system.

They are the essential tool of any AI developer. Without this continuous feedback loop, your AI app will become impossible to change.

I'll be posting a lot more about evals. We'll be diving into deterministic evals, how to use LLM's as judges, and enriching your evals with production data. If you want to learn more, sign up below.

---

# The Eval Developer Pipeline

We now know a little of why evals are so useful. But how do you run them? How do you make them a part of your developer pipeline?
