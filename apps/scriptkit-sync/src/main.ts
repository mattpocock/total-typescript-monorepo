import {
  SCRIPTKIT_SCRIPTS_LOCATION,
  type AbsolutePath,
  type RelativePath,
} from "@total-typescript/shared";
import { commands } from "@total-typescript/internal-cli";
import { readFile, readdir, rm, writeFile } from "fs/promises";
import path from "path";

const SYNC_INDICATOR = "scriptkit-sync";

const relativeScripts = (await readdir(
  SCRIPTKIT_SCRIPTS_LOCATION,
)) as RelativePath[];

const absoluteScripts = relativeScripts.map((relativeScript) =>
  path.join(SCRIPTKIT_SCRIPTS_LOCATION, relativeScript),
) as AbsolutePath[];

const scriptsNotControlledBySync: AbsolutePath[] = [];

for (const absoluteScript of absoluteScripts) {
  if (!absoluteScript.endsWith(".ts")) {
    continue;
  }

  const scriptContents = await readFile(absoluteScript, "utf-8");

  if (scriptContents.includes(SYNC_INDICATOR)) {
    await rm(absoluteScript);
  } else {
    scriptsNotControlledBySync.push(absoluteScript);
  }
}

for (const command of commands) {
  if (
    scriptsNotControlledBySync.some((script) => {
      return path.parse(script).name === command.fileName;
    })
  ) {
    continue;
  }

  const scriptLocation = path.join(
    SCRIPTKIT_SCRIPTS_LOCATION,
    `${command.fileName}.ts`,
  );

  const args: string[] = command.args || [];

  const argsParsed = args.map((arg) => {
    const lowercaseArg = arg.toLowerCase().replaceAll(" ", "");
    return {
      name: lowercaseArg,
      label: arg,
    };
  });

  await writeFile(
    scriptLocation,
    [
      `// Name: ${command.scriptkitName}`,
      `// Description: ${command.description}`,
      "",
      `// ${SYNC_INDICATOR}`,
      "",
      `import "@johnlindquist/kit";`,
      argsParsed
        .map((parsedArg) => {
          return `const ${parsedArg.name} = await arg("${parsedArg.label}");`;
        })
        .join("\n"),
      "",
      `await $\`tt ${command.cliCommand} ${argsParsed
        .map((parsedArg) => {
          return `"\${${parsedArg.name}}"`;
        })
        .join(" ")}\`;`,
    ].join("\n"),
  );
}
