# Contributing

## Workflow

1. Create a feature branch from `main`.
2. Make focused changes.
3. Run the app and verify behavior.
4. Open a pull request with clear description.

## Commit Style

Use concise commit messages with prefixes when possible:

- `feat:` new functionality
- `fix:` bug fixes
- `docs:` documentation changes
- `chore:` maintenance work

## Local Validation

```bash
npm install
npm start
```

Optional database checks:

```bash
npm run db:view
npm run db:clear -- --help
```
