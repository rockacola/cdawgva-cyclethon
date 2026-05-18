# CLAUDE.md

## Documentation

When making changes, keep docs in sync:

- Files added/removed/renamed → update the structure tree in `docs/overview.md`
- New pipeline steps or architectural changes → update the architecture section in `docs/overview.md`
- New npm scripts or prerequisites → update `docs/getting-started.md`
- Features completed → mark `[x]` in `docs/tasks.md` if it exists

## Git commits

Single-line conventional commits only — no body, no bullet points:

```
feat: add websocket support for real-time donation push
fix: handle empty pagination cursor from Tiltify API
chore: bump openapi-typescript to v8
```

Types: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`

## Code style

- Always use braces for `if`/`for`/`while` (enforced via ESLint `curly: all`)
- Sort object keys alphabetically when order has no semantic meaning
- `import type` must be separate from value imports (enforced via ESLint)
- Use `Number.isNaN()` and `Number.isFinite()` — never the global versions
- No `any` casts; prefer unknown + narrowing or generated types from OpenAPI

## Scripts

Run `npm run check` before committing — it runs format, lint, and typecheck together.

The `check` script lives in each sub-package (`scripts/tiltify-api/`, `scripts/tiltify-page-scrap/`). Run it from the relevant directory.
