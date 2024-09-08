import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const todaysDate = new Date().toISOString();

const isScratch = Boolean(process.env.SCRATCH);

const newPath = path.join(
  process.cwd(),
  isScratch ? "scratch" : "noteworthy-topic",
  todaysDate,
);

fs.mkdirSync(newPath, {
  recursive: true,
});

const articlePath = path.join(newPath, "thread.md");

fs.writeFileSync(articlePath, "");

execSync(`code ${articlePath}`);
