const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "data", "recipes.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new sqlite3.Database(dbPath);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const initialRecipes = [
  {
    title: "Lemon Garlic Pasta",
    author: "Alex",
    description: "A bright, quick pasta with lemon zest, garlic, olive oil, and parmesan.",
    prepTime: "20 min",
    servings: 2,
    tags: ["Quick", "Vegetarian"]
  },
  {
    title: "Spiced Chickpea Bowl",
    author: "Sam",
    description: "Roasted chickpeas, herbed rice, cucumber salad, and tahini drizzle.",
    prepTime: "30 min",
    servings: 3,
    tags: ["High Protein", "Meal Prep"]
  },
  {
    title: "Berry Yogurt Parfait",
    author: "Nina",
    description: "Layers of Greek yogurt, berries, granola, and honey.",
    prepTime: "10 min",
    servings: 1,
    tags: ["Breakfast", "No Cook"]
  }
];

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });
}

function parseTags(tags) {
  if (!tags) {
    return [];
  }

  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
}

async function initDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      description TEXT NOT NULL,
      prep_time TEXT NOT NULL,
      servings TEXT NOT NULL,
      tags TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const existing = await get("SELECT COUNT(*) AS count FROM recipes");

  if (existing.count === 0) {
    for (const recipe of initialRecipes) {
      await run(
        `
          INSERT INTO recipes (title, author, description, prep_time, servings, tags)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          recipe.title,
          recipe.author,
          recipe.description,
          recipe.prepTime,
          String(recipe.servings),
          JSON.stringify(recipe.tags)
        ]
      );
    }
  }
}

app.get("/", async (req, res) => {
  try {
    const rows = await all(`
      SELECT id, title, author, description, prep_time, servings, tags
      FROM recipes
      ORDER BY datetime(created_at) DESC, id DESC
    `);

    const recipes = rows.map((row) => ({
      id: row.id,
      title: row.title,
      author: row.author,
      description: row.description,
      prepTime: row.prep_time,
      servings: row.servings,
      tags: parseTags(row.tags)
    }));

    res.render("index", { recipes });
  } catch (error) {
    console.error("Failed to load recipes:", error);
    res.status(500).send("Failed to load recipes.");
  }
});

app.post("/recipes", async (req, res) => {
  const { title, author, description, prepTime, servings, tags } = req.body;

  if (!title || !author || !description) {
    return res.status(400).send("Title, author, and description are required.");
  }

  const parsedTags = (tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  try {
    await run(
      `
        INSERT INTO recipes (title, author, description, prep_time, servings, tags)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        title.trim(),
        author.trim(),
        description.trim(),
        prepTime?.trim() || "N/A",
        Number(servings) > 0 ? String(Number(servings)) : "N/A",
        JSON.stringify(parsedTags)
      ]
    );

    res.redirect("/");
  } catch (error) {
    console.error("Failed to save recipe:", error);
    res.status(500).send("Failed to save recipe.");
  }
});

app.post("/recipes/:id/delete", async (req, res) => {
  const recipeId = Number(req.params.id);

  if (!Number.isInteger(recipeId) || recipeId <= 0) {
    return res.status(400).send("Invalid recipe id.");
  }

  try {
    await run("DELETE FROM recipes WHERE id = ?", [recipeId]);
    res.redirect("/");
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    res.status(500).send("Failed to delete recipe.");
  }
});

async function startServer() {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`Recipe app is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}

startServer();
