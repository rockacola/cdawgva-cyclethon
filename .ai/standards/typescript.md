# Standard: TypeScript

Project-specific elaboration of `.ai/standards/coding.md` for this repository's TypeScript code.

## Rules

### Syntax

- Always use braces for `if`/`for`/`while` (enforced via ESLint `curly: all`)
- `import type` must be separate from value imports (enforced via ESLint)
- Use `Number.isNaN()` and `Number.isFinite()`, never the global versions
- No `any` casts; prefer `unknown` plus narrowing, or generated types from the OpenAPI spec

### Style

- Sort object keys alphabetically when order has no semantic meaning

### Documentation sync

When making changes, keep docs in sync in the same commit:

- Files added/removed/renamed, update the structure tree in `docs/overview.md`
- New pipeline steps or architectural changes, update the architecture section in `docs/overview.md`
- New npm scripts or prerequisites, update `docs/getting-started.md`
- Task completed, update its `Status` line in `.ai/tasks/active/{name}.md` and move the file to
  `.ai/tasks/completed/{name}.md`

### Pre-commit checks

- Run `npm run check` before committing. It runs format, lint, and typecheck together from the repo
  root (single root package, no sub-packages).

## Rationale

ESLint-enforced rules here are backstopped by CI; stating them explicitly saves a lint-fix round
trip. The documentation-sync triggers are concrete enough to follow without re-deriving intent from
`coding.md`'s generic "keep docs in sync" rule each time.

## Examples

See `.ai/tasks/completed/consolidate-scripts-into-root-package.md` for the commit that established
the single-root-package layout these checks assume.
