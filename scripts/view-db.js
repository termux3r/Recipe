const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "data", "recipes.db");
const db = new sqlite3.Database(dbPath);

db.all(
  `
    SELECT id, title, author, prep_time AS prepTime, servings, tags, created_at AS createdAt
    FROM recipes
    ORDER BY id DESC
  `,
  (error, rows) => {
    if (error) {
      console.error("Failed to read recipes:", error.message);
      process.exitCode = 1;
      db.close();
      return;
    }

    if (!rows.length) {
      console.log("No recipes found.");
      db.close();
      return;
    }

    const formattedRows = rows.map((row) => ({
      ...row,
      tags: (() => {
        try {
          const parsed = JSON.parse(row.tags);
          return Array.isArray(parsed) ? parsed.join(", ") : "";
        } catch {
          return "";
        }
      })()
    }));

    console.table(formattedRows);
    db.close();
  }
);
