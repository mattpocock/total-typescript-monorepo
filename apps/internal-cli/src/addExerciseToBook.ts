import {
  exitProcessWithError,
  returnMarkdownHeadingsAndContents,
  type AbsolutePath,
  type HeadingWithContentSection,
} from "@total-typescript/shared";
import { execSync } from "child_process";
import fg from "fast-glob";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import prompts from "prompts";

const searchToGlob = (search: {
  num?: string;
  allowedTypes?: ("explainer" | "solution" | "problem")[];
}) => {
  return `**/${search?.num ?? ""}*.{${search?.allowedTypes?.join(",") ?? ""}}*`;
};

export const findAllExercises = async (
  srcPath: string,
  search: {
    num?: string;
    allowedTypes: ("explainer" | "solution" | "problem")[];
  },
): Promise<string[]> => {
  const glob = searchToGlob(search || {});

  const allExercises = await fg(
    path.join(srcPath, "**", glob).replace(/\\/g, "/"),
    {
      onlyFiles: false,
    },
  );

  return allExercises.sort((a, b) => a.localeCompare(b));
};

export const addExerciseToBook = async (glob: string) => {
  const files = (await fg(glob, { absolute: true })) as AbsolutePath[];

  const allExercisesInRepo = (await findAllExercises(
    path.join(process.cwd(), "src"),
    {
      allowedTypes: ["problem", "explainer"],
    },
  )) as AbsolutePath[];

  for (const file of files) {
    while (true) {
      const fileContents = await readFile(file, "utf-8");
      const markdownSections = returnMarkdownHeadingsAndContents(fileContents);

      const sectionIndex = markdownSections.findIndex((section) => {
        return (
          section.type === "heading-with-content" &&
          section.heading.includes("Exercise ") &&
          !section.content.includes("<Exercise")
        );
      });

      if (sectionIndex === -1) {
        break;
      }

      const section = markdownSections[
        sectionIndex
      ] as HeadingWithContentSection;

      console.log(`${file}:${section.startIndex + 1}`);
      execSync(`code -g "${file}:${section.startIndex + 1}"`);

      const { exercise }: { exercise?: AbsolutePath } = await prompts({
        name: "exercise",
        message: `Select exercise for ${section.heading}`,
        type: "autocomplete",
        choices: allExercisesInRepo.map((exercise) => ({
          value: exercise,
          title: path.relative(process.cwd(), exercise),
        })),
        suggest: async (input, choices) => {
          return choices.filter((choice) => choice.title.includes(input));
        },
      });

      if (!exercise) {
        exitProcessWithError("No exercise selected");
      }

      const codeToAdd = [
        "",
        [
          "<Exercise",
          `title="${section.heading}"`,
          `filePath="/${path.relative(process.cwd(), exercise)}"`,
          "/>",
        ].join(" "),
        "",
      ].join("\n");

      section.content = `${section.content}${codeToAdd}`;

      const newFileContents = markdownSections
        .map((section) => {
          if (section.type === "heading-with-content") {
            return `${`#`.repeat(section.headingLevel)} ${section.heading}${section.content}`;
          } else {
            return section.content;
          }
        })
        .join("\n");

      await writeFile(file, newFileContents.trim(), "utf-8");
    }
  }
};
