# Content

Prompt engineering overview - Anthropic
Anthropic home pagelight logo
[https://mintlify.s3-us-west-1.amazonaws.com/anthropic/logo/light.svg]dark logo
[https://mintlify.s3-us-west-1.amazonaws.com/anthropic/logo/dark.svg] [/]
English
Search...
 * Go to claude.ai [https://claude.ai/]
 * Research [https://www.anthropic.com/research]
 * News [https://www.anthropic.com/news]
 * Go to claude.ai
   [https://claude.ai/]


Search
Navigation
Prompt engineering
Prompt engineering overview
Welcome

[/en/home]User Guides

[/en/docs/welcome]API Reference

[/en/api/getting-started]Prompt Library

[/en/prompt-library/library]Release Notes

[/en/release-notes/overview]Developer Newsletter

[/en/developer-newsletter/overview]
 * 
   Developer Console [https://console.anthropic.com/]
 * 
   Developer Discord [https://www.anthropic.com/discord]
 * 
   Support [https://support.anthropic.com/]

   GET STARTED
   
   Overview
   [/en/docs/welcome]
   Initial setup
   [/en/docs/initial-setup]
   Intro to Claude
   [/en/docs/intro-to-claude]

   LEARN ABOUT CLAUDE
   
   Use cases
   Models
   [/en/docs/about-claude/models]
   Security and compliance
   [https://trust.anthropic.com/]

   BUILD WITH CLAUDE
   
   Define success criteria
   [/en/docs/build-with-claude/define-success]
   Develop test cases
   [/en/docs/build-with-claude/develop-tests]
   Prompt engineering
   * Overview
     [/en/docs/build-with-claude/prompt-engineering/overview]
   * Prompt generator
     [/en/docs/build-with-claude/prompt-engineering/prompt-generator]
   * Be clear and direct
     [/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct]
   * Use examples (multishot prompting)
     [/en/docs/build-with-claude/prompt-engineering/multishot-prompting]
   * Let Claude think (CoT)
     [/en/docs/build-with-claude/prompt-engineering/chain-of-thought]
   * Use XML tags
     [/en/docs/build-with-claude/prompt-engineering/use-xml-tags]
   * Give Claude a role (system prompts)
     [/en/docs/build-with-claude/prompt-engineering/system-prompts]
   * Prefill Claude's response
     [/en/docs/build-with-claude/prompt-engineering/prefill-claudes-response]
   * Chain complex prompts
     [/en/docs/build-with-claude/prompt-engineering/chain-prompts]
   * Long context tips
     [/en/docs/build-with-claude/prompt-engineering/long-context-tips]
   Text generation
   [/en/docs/build-with-claude/text-generation]
   Embeddings
   [/en/docs/build-with-claude/embeddings]
   Google Sheets add-on
   [/en/docs/build-with-claude/claude-for-sheets]
   Vision
   [/en/docs/build-with-claude/vision]
   Tool use (function calling)
   [/en/docs/build-with-claude/tool-use]
   Computer use (beta)
   [/en/docs/build-with-claude/computer-use]
   Prompt caching (beta)
   [/en/docs/build-with-claude/prompt-caching]
   Message Batches (beta)
   [/en/docs/build-with-claude/message-batches]
   PDF support (beta)
   [/en/docs/build-with-claude/pdf-support]
   Token counting (beta)
   [/en/docs/build-with-claude/token-counting]

   TEST AND EVALUATE
   
   Strengthen guardrails
   Using the Evaluation Tool
   [/en/docs/test-and-evaluate/eval-tool]

   RESOURCES
   
   Glossary
   [/en/docs/resources/glossary]
   Model Deprecations
   [/en/docs/resources/model-deprecations]
   System status
   [https://status.anthropic.com/]
   Claude 3 model card
   [https://assets.anthropic.com/m/61e7d27f8c8f5919/original/Claude-3-Model-Card.pdf]
   Anthropic Cookbook
   [https://github.com/anthropics/anthropic-cookbook]
   Anthropic Courses
   [https://github.com/anthropics/courses]

   LEGAL CENTER
   
   Anthropic Privacy Policy
   [https://www.anthropic.com/legal/privacy]

Prompt engineering


PROMPT ENGINEERING OVERVIEW



BEFORE PROMPT ENGINEERING

This guide assumes that you have:

 1. A clear definition of the success criteria for your use case
 2. Some ways to empirically test against those criteria
 3. A first draft prompt you want to improve

If not, we highly suggest you spend time establishing that first. Check out
Define your success criteria [/en/docs/build-with-claude/define-success] and
Create strong empirical evaluations [/en/docs/build-with-claude/develop-tests]
for tips and guidance.


PROMPT GENERATOR

Don’t have a first draft prompt? Try the prompt generator in the Anthropic
Console!

[https://console.anthropic.com/dashboard]

--------------------------------------------------------------------------------


WHEN TO PROMPT ENGINEER

This guide focuses on success criteria that are controllable through prompt
engineering. Not every success criteria or failing eval is best solved by prompt
engineering. For example, latency and cost can be sometimes more easily improved
by selecting a different model.

Prompting vs. finetuning

Prompt engineering is far faster than other methods of model behavior control,
such as finetuning, and can often yield leaps in performance in far less time.
Here are some reasons to consider prompt engineering over finetuning:


 * Resource efficiency: Fine-tuning requires high-end GPUs and large memory,
   while prompt engineering only needs text input, making it much more
   resource-friendly.
 * Cost-effectiveness: For cloud-based AI services, fine-tuning incurs
   significant costs. Prompt engineering uses the base model, which is typically
   cheaper.
 * Maintaining model updates: When providers update models, fine-tuned versions
   might need retraining. Prompts usually work across versions without changes.
 * Time-saving: Fine-tuning can take hours or even days. In contrast, prompt
   engineering provides nearly instantaneous results, allowing for quick
   problem-solving.
 * Minimal data needs: Fine-tuning needs substantial task-specific, labeled
   data, which can be scarce or expensive. Prompt engineering works with
   few-shot or even zero-shot learning.
 * Flexibility & rapid iteration: Quickly try various approaches, tweak prompts,
   and see immediate results. This rapid experimentation is difficult with
   fine-tuning.
 * Domain adaptation: Easily adapt models to new domains by providing
   domain-specific context in prompts, without retraining.
 * Comprehension improvements: Prompt engineering is far more effective than
   finetuning at helping models better understand and utilize external content
   such as retrieved documents
 * Preserves general knowledge: Fine-tuning risks catastrophic forgetting, where
   the model loses general knowledge. Prompt engineering maintains the model’s
   broad capabilities.
 * Transparency: Prompts are human-readable, showing exactly what information
   the model receives. This transparency aids in understanding and debugging.

--------------------------------------------------------------------------------


HOW TO PROMPT ENGINEER

The prompt engineering pages in this section have been organized from most
broadly effective techniques to more specialized techniques. When
troubleshooting performance, we suggest you try these techniques in order,
although the actual impact of each technique will depend on our use case.

 1. Prompt generator
    [/en/docs/build-with-claude/prompt-engineering/prompt-generator]
 2. Be clear and direct
    [/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct]
 3. Use examples (multishot)
    [/en/docs/build-with-claude/prompt-engineering/multishot-prompting]
 4. Let Claude think (chain of thought)
    [/en/docs/build-with-claude/prompt-engineering/chain-of-thought]
 5. Use XML tags [/en/docs/build-with-claude/prompt-engineering/use-xml-tags]
 6. Give Claude a role (system prompts)
    [/en/docs/build-with-claude/prompt-engineering/system-prompts]
 7. Prefill Claude’s response
    [/en/docs/build-with-claude/prompt-engineering/prefill-claudes-response]
 8. Chain complex prompts
    [/en/docs/build-with-claude/prompt-engineering/chain-complex-prompts]
 9. Long context tips
    [/en/docs/build-with-claude/prompt-engineering/long-context-tips]

--------------------------------------------------------------------------------


PROMPT ENGINEERING TUTORIAL

If you’re an interactive learner, you can dive into our interactive tutorials
instead!


GITHUB PROMPTING TUTORIAL

An example-filled tutorial that covers the prompt engineering concepts found in
our docs.

[https://github.com/anthropics/prompt-eng-interactive-tutorial]


GOOGLE SHEETS PROMPTING TUTORIAL

A lighter weight version of our prompt engineering tutorial via an interactive
spreadsheet.

[https://docs.google.com/spreadsheets/d/19jzLgRruG9kjUQNKtCg1ZjdD6l6weA6qRXG5zLIAhC8]
Develop test cases [/en/docs/build-with-claude/develop-tests]Prompt generator
[/en/docs/build-with-claude/prompt-engineering/prompt-generator]
x [https://x.com/AnthropicAI]linkedin
[https://www.linkedin.com/company/anthropicresearch]
On this page
 * Before prompt engineering
 * When to prompt engineer
 * How to prompt engineer
 * Prompt engineering tutorial

# Summary

<summary>
The article from Anthropic provides an overview of prompt engineering, a technique used to optimize the performance of AI models by crafting effective prompts. Before engaging in prompt engineering, it is crucial to define success criteria and develop empirical tests to evaluate performance. The article emphasizes that prompt engineering is a more resource-efficient, cost-effective, and time-saving alternative to fine-tuning models. It allows for rapid iteration and adaptation to new domains without the need for extensive data or retraining.

Prompt engineering is particularly advantageous because it preserves the model's general knowledge, offers transparency, and improves comprehension of external content. The guide outlines a series of techniques for effective prompt engineering, starting with using a prompt generator, being clear and direct, employing examples, and allowing the model to think through a chain of thought. Other techniques include using XML tags, assigning roles through system prompts, pre-filling responses, chaining complex prompts, and managing long contexts.

For those interested in learning more, Anthropic offers interactive tutorials on GitHub and Google Sheets, providing practical examples and exercises to enhance understanding of prompt engineering concepts.
</summary>

<quote>"Prompt engineering is far faster than other methods of model behavior control, such as finetuning, and can often yield leaps in performance in far less time."</quote>
<quote>"Fine-tuning requires high-end GPUs and large memory, while prompt engineering only needs text input, making it much more resource-friendly."</quote>
<quote>"Prompts usually work across versions without changes."</quote>
<quote>"Prompt engineering provides nearly instantaneous results, allowing for quick problem-solving."</quote>
<quote>"Prompt engineering works with few-shot or even zero-shot learning."</quote>
<quote>"Prompt engineering is far more effective than finetuning at helping models better understand and utilize external content such as retrieved documents."</quote>
<quote>"Prompts are human-readable, showing exactly what information the model receives."</quote>
<quote>"The prompt engineering pages in this section have been organized from most broadly effective techniques to more specialized techniques."</quote>
<quote>"If you’re an interactive learner, you can dive into our interactive tutorials instead!"</quote>