const path = require("path");
const readline = require("readline");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "data", "recipes.db");
const force = process.argv.includes("--force");
const yes = process.argv.includes("--yes");
const help = process.argv.includes("--help") || process.argv.includes("-h");
const isProduction = process.env.NODE_ENV === "production";

if (help) {
  console.log("Usage: npm run db:clear [-- --yes] [-- --force]");
  console.log("  --yes    Skip confirmation prompt");
  console.log("  --force  Allow running in NODE_ENV=production");
  process.exit(0);
}

if (isProduction && !force) {
  console.error("Refusing to clear DB in production. Re-run with -- --force if you really intend this.");
  process.exit(1);
}

function clearDatabase() {
  const db = new sqlite3.Database(dbPath);

  db.run("DELETE FROM recipes", (error) => {
    if (error) {
      console.error("Failed to clear recipes:", error.message);
      process.exitCode = 1;
      db.close();
      return;
    }

    console.log("All recipes deleted successfully.");
    db.close();
  });
}

if (yes) {
  clearDatabase();
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Type DELETE to confirm clearing all recipes: ', (answer) => {
    rl.close();

    if (answer !== "DELETE") {
      console.log("Cancelled. No data was deleted.");
      return;
    }

    clearDatabase();
  });
}
