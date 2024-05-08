import fs from "fs";
import path from "path";

const todaysDate = new Date().toISOString();

const newPath = path.join(
  process.cwd(),
  "noteworthy-topic",
  todaysDate
);

fs.mkdirSync(newPath, {
  recursive: true,
});

const articlePath = path.join(newPath, "article.md");

fs.writeFileSync(articlePath, "");

console.log(articlePath);
