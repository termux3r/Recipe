# Recipe Share

A modern, responsive recipe sharing web app built with Node.js, Express, EJS, and SQLite.

## Features

- Create and share recipes
- View recipes in a clean card-based feed
- Delete recipes with confirmation
- Persistent storage with SQLite

## Tech Stack

- Node.js
- Express
- EJS
- SQLite3
- CSS (responsive design)

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run the app

```bash
npm start
```

App URL: `http://localhost:3000`

## Useful Scripts

- `npm start` — start server
- `npm run dev` — run server in dev mode
- `npm run db:view` — print recipes from database
- `npm run db:clear` — clear all recipes (with guardrails)

## Project Structure

```text
Recipe/
  data/
  public/
    styles.css
  scripts/
    clear-db.js
    view-db.js
  views/
    index.ejs
  server.js
  package.json
```
