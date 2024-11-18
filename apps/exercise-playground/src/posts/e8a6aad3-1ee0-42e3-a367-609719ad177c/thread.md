# AI Evals Explained for Normal Devs

- A series explaining Evals, the essential tool of the AI engineer, for normal software devs.
- Your system can only ever be as good as its evals.
- Without evals, your AI system operates on manual QA.

## In AI Systems, No Change Is Small

- All AI systems are subject to the butterfly effect. Tiny changes in a prompt or user input can result in enormous deltas in output.

- Normal software is more deterministic. The relationship between the inputs (the code) and the outputs (the behavior of the software) is often straightforward. Let's say you capitalize a single word in an app menu. You can be fairly confident in the outcome of that change.

- In AI systems, no change is small. GenAI's are black boxes. Their attention mechanisms are inscrutable. Capitalizing a single word in a prompt can create massive ripple effects. Whether a butterfly "flaps" or "Flaps" its wings may be of great consequence.

## "Vibes-only" Is A Killer

- With AI, it's easy to get an impressive demo working quickly. These prototypes can feel so high-quality that putting them in front of consumers can feel obvious.

- A Manual QA in deterministic software is usually doable. You say "I added a new page" and the QA team can rigorously test the new page, and smoke test the previous pages.

---

# What Are Evals?

## What Are Evals?

- Evals are like unit tests for your AI.
- Unit tests give you a pass/fail metric. Instead, evals give you a score on the quality of the response. They're a range slider, not a checkbox.
- Most software is deterministic. Software built with AI is probabilistic.

---

## Why Are Evals Important?

- Every AI system has a dependency on the underlying LLM.

## What Are The Alternative To Evals?

## Why Can't You Use Tests On AI?
