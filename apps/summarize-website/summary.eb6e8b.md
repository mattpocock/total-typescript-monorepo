# Content

Skip to main content
Stricli [/stricli/img/S-logo.svg]Stricli [/stricli/img/S-logo.svg]
Stricli [/stricli/]Documentation [/stricli/docs/getting-started/overview]API
[/stricli/packages]Blog [/stricli/blog]
GitHub [https://github.com/bloomberg/stricli/]



 * Getting Started [/stricli/docs/category/getting-started]
 * Tutorial [/stricli/docs/tutorial]
 * Features [/stricli/docs/category/features]
   * Argument Parsing [/stricli/docs/features/argument-parsing]
   * Command Routing [/stricli/docs/features/command-routing]
   * Isolated Context [/stricli/docs/features/isolated-context]
   * Configuration [/stricli/docs/features/configuration]
   * Shell Autocomplete [/stricli/docs/features/shell-autocomplete]
   * Out of Scope [/stricli/docs/features/out-of-scope]

 * /stricli/
 * Tutorial

On this page


TUTORIAL

This tutorial will get you started with a new, empty Stricli application and
show you how to modify it to suit your needs.


GENERATE A NEW NODE APPLICATION

If you have issues with this generator, please open an issue on its source repo
here [https://github.com/bloomberg/stricli/tree/main/packages/create-app].


STEP 1: @STRICLI/CREATE-APP

Run the following command.

npx @stricli/create-app@latest my-app




This command will create a new directory my-app and populate it with the
boilerplate for a Stricli application. You can also pass the following options
if you wish to customize the generated application.

FLAGS
     [--type]                              Package type, controls output format of JS files [commonjs|module, default = module]
     [--template]                          Application template to generate                 [single|multi, default = multi]
     [--auto-complete/--no-auto-complete]  Include auto complete postinstall script         [default = true]
  -n [--name]                              Package name, if different from directory
     [--command]                           Intended bin command, if different from name
  -d [--description]                       Package description                              [default = Stricli command line application]
     [--license]                           Package license                                  [default = MIT]
     [--author]                            Package author                                   [default = ""]
  -h  --help                               Print help information and exit
  -v  --version                            Print version information and exit

ARGUMENTS
  path  Target path of new package directory





STEP 2: INSTALL DEPENDENCIES

The generated application will only contain package.json. To actually install
the declared dependencies, cd to that directory and run npm install
--ignore-scripts. The ignore is needed when using --auto-complete (enabled by
default) as it adds a postinstall script to install the auto complete
functionality.


STEP 3: BUILD APPLICATION

The boilerplate includes a build script that invokes tsup
[https://tsup.egoist.dev/]. Note that this tool uses esbuild
[https://esbuild.github.io/] to compile the project to a single output file and
it will not perform type checking by default
[https://tsup.egoist.dev/#what-about-type-checking].


STEP 4: TEST THE OUTPUT

Stricli applications can be executed directly in source, or in a separate
script. This template generates a src/bin/cli.ts file to invoke run so that the
rest of the source only contains exports without side-effects. Try running your
new app by calling the compiled bin script at dist/cli.js with --help.

dist/cli.js --help
USAGE
  my-app subdir
  my-app nested foo|bar ...
  my-app --help
  my-app --version

Stricli command line application

FLAGS
  -h --help     Print this help information and exit
  -v --version  Print version information and exit

COMMANDS
  subdir  Command in subdirectory
  nested  Nested commands
dist/cli.js nested --help
USAGE
  my-app nested foo
  my-app nested bar
  my-app nested --help

Nested commands

FLAGS
  -h --help  Print this help information and exit

COMMANDS
  foo  Nested foo command
  bar  Nested bar command




You should see this exact output if you generated a multi-command app. Since
Stricli applications are all defined in code, you can keep this file layout or
move the files/declarations around as you want. Just be aware that everything
except the impl.ts files will be loaded synchronously on app load, so be mindful
of what you import and where.

SINGLE COMMAND

You can optionally choose to run npx @stricli/create-app@latest --template
single to generate a single command app.

If you generated a single command app, your initial output should look like
this:

dist/cli.js --help
USAGE
  my-app --count value arg1
  my-app --help
  my-app --version

Stricli command line application

FLAGS
     --count    Number of times to say hello
  -h --help     Print this help information and exit
  -v --version  Print version information and exit

ARGUMENTS
  arg1  Your name




If you see that output, you have successfully generated a new Stricli
application!

dist/cli.js World --count 3
Hello World!
Hello World!
Hello World!



Previous
Frequently Asked Questions
[/stricli/docs/getting-started/faq]
Next
Features
[/stricli/docs/category/features]
 * Generate a New Node Application
   * Step 1: @stricli/create-app
   * Step 2: Install dependencies
   * Step 3: Build application
   * Step 4: Test the output
     * Single Command

Docs
 * Getting Started [/stricli/docs/category/getting-started]
 * Tutorial [/stricli/docs/tutorial]
 * Features [/stricli/docs/category/features]

More
 * Blog [/stricli/blog]
 * GitHub [https://github.com/bloomberg/stricli/]

Copyright © 2024 Bloomberg Finance L.P. (Powered by Docusaurus)

# Summary

<summary>
The article provides a comprehensive tutorial on how to get started with Stricli, a command-line application framework. It guides users through the process of generating a new Node application using Stricli, installing necessary dependencies, building the application, and testing the output. The tutorial is structured in a step-by-step format, beginning with the creation of a new application using the `@stricli/create-app` command, which sets up a boilerplate for a Stricli application. Users are given options to customize the application with various flags and arguments.

After generating the application, the next step involves installing dependencies by navigating to the application directory and running `npm install --ignore-scripts`. This step is crucial for setting up the environment, especially when the auto-complete feature is enabled by default. The tutorial then moves on to building the application using a build script that leverages `tsup` and `esbuild` for compiling the project.

Finally, the article explains how to test the application by running the compiled script and checking the output. It provides examples of expected outputs for both multi-command and single-command applications, ensuring that users can verify the successful setup of their Stricli application. The tutorial emphasizes the flexibility of Stricli applications, allowing users to organize their code as desired while being mindful of synchronous loading during app initialization.
</summary>

<quote>"This tutorial will get you started with a new, empty Stricli application and show you how to modify it to suit your needs."</quote>
<quote>"Run the following command. npx @stricli/create-app@latest my-app"</quote>
<quote>"The generated application will only contain package.json. To actually install the declared dependencies, cd to that directory and run npm install --ignore-scripts."</quote>
<quote>"The boilerplate includes a build script that invokes tsup. Note that this tool uses esbuild to compile the project to a single output file and it will not perform type checking by default."</quote>
<quote>"Stricli applications can be executed directly in source, or in a separate script."</quote>
<quote>"You should see this exact output if you generated a multi-command app."</quote>
<quote>"If you see that output, you have successfully generated a new Stricli application!"</quote>