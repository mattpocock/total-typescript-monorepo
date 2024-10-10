# `JS0` and `JSSugar`: The Proposal To Split JavaScript

There's a proposal to fundamentally change the way JavaScript is run. This week, it'll be brought to the committee that decides JavaScript's direction: TC39. The speaker will be [Shu-yu Guo](https://x.com/_shu), TC39 editor.

I'm not sure I've ever seen a more controversial [slide deck](https://docs.google.com/presentation/d/1ylROTu3N6MyHzNzWJXQAc7Bo1O0FHO3lNKfQMfPOA4o/edit#slide=id.p).

## The Proposal

The proposal would split JavaScript into two languages.

- `JS0` would be JavaScript as it exists today.
- New features would be added to a separate language, `JSSugar`, which would be bundled into `JS0`.
- Some features in `JSSugar` could then be brought in to `JS0` "[if there's a clear advantage](https://docs.google.com/presentation/d/1ylROTu3N6MyHzNzWJXQAc7Bo1O0FHO3lNKfQMfPOA4o/edit#slide=id.g30432c5cd9c_0_829)".

This would mean that anyone wanting to use `JSSugar` would need to bundle their code. Engines like V8, used by Node and the browser, would likely only work with `JS0`.

My plan in this article is not to pass judgment on the proposal. [Plenty](https://x.com/nullvoxpopuli/status/1842389133810913338) [of](https://x.com/wooorm/status/1842638052251807794) [others](https://x.com/skmruiz/status/1842506064236839364) [are](https://x.com/kentcdodds/status/1842688013811552315) [already](https://x.com/SirSeanOfLoxley/status/1842523710562947495) [doing](https://x.com/BrendanEich/status/1842644041068114171) [that](https://x.com/maxcallstack/status/1842511715130376382). It's a proposal [designed to provoke discussion](https://x.com/_shu/status/1842702923832455382), not to capture nuance. So, I'll try to add some nuance.

## Definitions of Terms

### JavaScript Engine

This is a bit of software that takes in JavaScript and executes it. They're usually embedded inside browsers, or inside execution environments like Node.js.

V8 is the most-used. It runs JavaScript on Chrome, Edge, Brave and Node.js.

## The Current State Of JavaScript

I'll start by writing a few words on how JavaScript currently works. If you're well-versed in TC39 and bundling, skim it or skip it.

### JavaScript Changes Slowly

JavaScript can feel like a pressure cooker of invention. New libraries and frameworks pop up every week. But the underlying language changes very slowly and steadily.

Each change to the language (to add a new global method, or a new piece of syntax) has to be proposed to TC39 first. It then goes through various stages, from Stage Zero (a new proposal, "not currently being considered") to Stage Four (complete, with "no further changes"). The committee receives presentations, and decides whether [to move it up or down the stages](https://tc39.es/process-document/). This [GitHub repo](https://github.com/tc39/proposals) lets you track all proposals under consideration.

The committee has some astonishingly difficult constraints. First, they must not break the web. A piece of JavaScript written in 1999 must still run today. Second, and crucially for this conversation, **every new piece of syntax needs to be implemented by JavaScript engines**.

This means that engine maintainers form a crucial bloc in TC39 discussions. The [Records and Tuples](https://github.com/tc39/proposal-record-tuple) proposal to add immutable objects to JavaScript is very exciting for developers (or, certainly was when it was first proposed). But engine maintainers have given consistent feedback that it would be difficult to implement, and any implementation would likely be slow.

These discussions raise the bar for any JS proposal, which ends up as a net positive. As [Dan Ehrenburg writes](https://gist.github.com/littledan/a590784a72f2e1b8cc633ff5ff8a9dc2), this helps TC39 "maintain its quality standards".

### Developers Mostly Bundle Their Code

The deck makes some key assumptions that I think are largely correct.

The first is that for most JS developers, **the code they write doesn't look like the code they ship**. Most developers transform their code in some way before it gets run in a JavaScript engine.

This can be to optimize their bundle size via minification. Or it can be to add language features that don't exist in plain JavaScript, like TypeScript types.

The second is that as a JavaScript developer, **you're never entirely sure which new language features you're allowed to use**. Different engines add language features at different speeds, so what may work one browser won't work on another. Sites like [caniuse.com](https://caniuse.com/) and [Baseline](https://web.dev/baseline) help keep developers up-to-date, but it's always at the back of your mind.

This has been happening for a long time. The last version of JavaScript that Internet Explorer supported, ES5, was announced in 2009. Until it reached end-of-life in 2022, JavaScript developers were locked in to bundling their apps to use new language features.

So, I think the proposal has a good read on how most JavaScript developers write code.

## New Language Features Are Bad For Users

The revolutionary idea in this proposal is that new language features are a positive for developers, but a negative for users.

Your **users don't care about your code**. Your users don't care how beautiful your codebase is, or whether you're using up-to-date language features. They want the application to work. They want their data to be secure.

The proposal outlines [several CVE's caused by new language features](https://docs.google.com/presentation/d/1ylROTu3N6MyHzNzWJXQAc7Bo1O0FHO3lNKfQMfPOA4o/edit#slide=id.g30432c5cd9c_0_162), despite browser vendor's best efforts. A language that is more stable means the engine can be [more secure and performant](https://docs.google.com/presentation/d/1ylROTu3N6MyHzNzWJXQAc7Bo1O0FHO3lNKfQMfPOA4o/edit#slide=id.g30432c5cd9c_0_272). Fewer features make a codebase easier to change, and thus easier to optimize and secure.

## `JS0` Will Be The Baseline

The proposal would create two stages of JavaScript. `JS0` would be the thing engines would implement. It would likely be extremely stable, adding features slowly. This would create two benefits. First, it would lead to more stability for users, as described above.

But it might also lead to more unity among different execution environments. We'd end up with a relatively simple 'core' of JavaScript features. If every environment implements `JS0`, you can be pretty sure that your feature will work.

## `JSSugar` Sounds Exciting

Developers would be mostly writing `JSSugar`, where exciting features could be added more freely. The often dreamed-of pipeline operator

## `JSSugar` vs Stage 3

## Engine Maintainers Might Check Out
