Since the AI-assisted development era began, I have had dozens and dozens of requests to share my `.cursor/rules` for writing TypeScript code.

I was hoping to rely on community resources for this. There are dozens of directories springing up to document different folks' Cursor rules.

But my brief explorations into these community directories have been disappointing. The rules that are there are low-quality, underwritten, low on code examples, and not widely applicable.

So I'm here to give you my Cursor rules, such as they are. I don't think they're perfect. They are not as battle-tested as I would like.

But I do think that we, as a community, need to start coming to some consensus as to what makes a good cursor rule. So I'm hoping that this article will kick off that discussion.

## The Rules

I've designed these rules so that they don't focus on specific frameworks or libraries. Instead, they are just focused on the TypeScript language.

This means that anywhere you use TypeScript, these rules should benefit you.

They fall into a few different buckets:

- **Language features**: preferring `as const` to enums, preferring `import type` to `import { type }`, `readonly` properties
- **Documentation**: prompting the LLM to use JSDoc comments better
- **Code Structure**: preferring `Result` over `try/catch`, allowing `any` inside generic functions, discriminated unions, return types on functions
- **Teaching The LLM About TypeScript**: helping it understand `noUncheckedIndexedAccess`
- **Library usage**: preferring to install packages via CLI instead of manually editing `package.json`

You can download them here.

## What makes a good Cursor rule?

There are two kinds of cursor rules that come to mind.

### Workspace Rules

The first kind of cursor rules are workspace rules. These are rules which are checked into Git and versioned alongside your code.

This type of cursor rule lets you do a few things:

- Tell the AI which version of packages you are using
- Give the AI an idea of the structure of your project
- Provide framework and library-specific advice

### Global Rules

The second kind of cursor rule are rules which are tailored for you.

These are rules which are not checked into Git, but live in your IDE.

They are rules which are specific to your coding style, your preferences and your workflow. They let you:

- Customize the behavior of the AI by giving it role-based prompts: "Think deeply about each problem", "use simple solutions"
- Add workflow based commands: "commit your work after each task"
