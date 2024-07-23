import path from "path";
import Database from "better-sqlite3";
import { loadFilesFromWrittenContent } from "~/loadFilesFromWrittenContent";
import { rm } from "fs/promises";

export const DB_PATH = path.resolve(import.meta.dirname, "manager.db");

export const seed = async () => {
  const db = new Database(DB_PATH);
  await rm(DB_PATH, { force: true });
  db.exec(/* sql */ `
    CREATE TABLE IF NOT EXISTS "content-item" (
      "id" TEXT PRIMARY KEY NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

  db.exec(/* sql */ `
    CREATE TABLE IF NOT EXISTS "content-item-tag" (
      "content_item_id" TEXT NOT NULL,
      "tag" TEXT NOT NULL,
      "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY ("content_item_id", "tag"),
      FOREIGN KEY ("content_item_id") REFERENCES "content-item" ("id")
    )`);

  db.exec(/* sql */ `
    CREATE TABLE IF NOT EXISTS "content-item-file" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "content_item_id" TEXT NOT NULL,
      "filename" TEXT NOT NULL,
      "content" TEXT,
      "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("content_item_id") REFERENCES "content-item" ("id")
    )`);

  const writtenContent = await loadFilesFromWrittenContent();

  for (const group of writtenContent) {
    console.log(group);

    const contentItem = db
      .prepare<{}, { id: string }>(
        /* sql */ `
      INSERT INTO "content-item" (id, name)
      VALUES (@id, @name)
      RETURNING id
    `,
      )
      .run({
        id: `${group.base}/${group.name}`,
        name: group.name,
      });

    console.log(contentItem);

    for (const tag of group.tags) {
      db.prepare(
        /* sql */ `
        INSERT INTO "content-item-tag" (content_item_id, tag)
        VALUES (@content_item_id, @tag)
      `,
      ).run({
        content_item_id: contentItem.lastInsertRowid,
        tag,
      });
    }

    // for (const file of group.files) {
    //   db.prepare(
    //     /* sql */ `
    //     INSERT INTO "content-item-file" (content_item_id, filename, content)
    //     VALUES (@content_item_id, @filename, @content)
    //   `,
    //   ).run({
    //     content_item_id: contentItem.id,
    //     filename: file.name,
    //     content: file.content,
    //   });
    // }
  }
};
