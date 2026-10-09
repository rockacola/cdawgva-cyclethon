# Consolidate into a single root package, modernize to native-TS scripts

Status: drafted, not yet approved for execution.

## Context

The repo currently has two independent sub-projects under `scripts/` (`tiltify-api`, `tiltify-page-scrap`), each with its own `package.json`, `node_modules`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`, and `.tool-versions` — despite both being identical in tooling and neither needing dependency isolation from the other. This duplicates config, duplicates a utility file verbatim, and requires `ts-node` + a CommonJS build step to run anything.

Goal: flatten both into standalone TypeScript scripts under one root-level `scripts/` dir with a single root `package.json`, matching the pattern already proven in `manga-sync-v2` — ESM (`"type": "module"`), `tsconfig` with `module`/`moduleResolution: nodenext`, and scripts executed directly via `node --disable-warning=ExperimentalWarning scripts/foo.ts` (Node 24's native TS type-stripping, no `ts-node`, no `tsc` build/dist step). Additionally, separate concerns that were loosely scattered at repo root: TS scripts live in `scripts/`, bash/system scripts get their own `bin/` dir (not loose at root), and local file I/O moves under a `data/` dir (gitignored wholesale, like `manga-sync-v2`) instead of a bare `output/`.

Decisions already confirmed with the user:
- Go all-in on ESM + native Node TS execution (not a minimal CommonJS-preserving move).
- Drop `scripts/tiltify-api/src/build-donations.ts` — it's self-labeled `DEPRECATED`, wired into no npm script or CI, and writes to a `../../../webapp/` path that no longer exists in this repo.
- Migrate `tiltify-page-scrap` forward as a working standalone script (not dropped), even though it's superseded by the API pipeline.
- Bash/system scripts (`refresh.sh`, `backup-r2.sh`, and the two per-project `run.sh`) move into a new `bin/` dir.
- Local snapshot/output files move from a bare `output/` into `data/output/`; a `data/inbox/` dir is also scaffolded (gitignored, for future user-provided input files — nothing currently populates it, no code change needed beyond the `.gitignore` entry and documenting it).

## Current structure (before) — snapshot as of 2026-10-09

```
.
├── .tool-versions                              nodejs 24.14.1
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── backup-r2.sh                                reads scripts/tiltify-api/.env
├── refresh.sh                                   cd's into scripts/tiltify-api, raw ts-node call
├── docs/
│   ├── overview.md
│   └── getting-started.md
├── backups/, logs/, errors/                    runtime output, gitignored
└── scripts/
    ├── tiltify-api/                             production pipeline, own package.json
    │   ├── .env / .env.example
    │   ├── .gitignore / .prettierrc / .tool-versions / eslint.config.mjs / tsconfig.json
    │   ├── package.json / package-lock.json / node_modules/
    │   ├── README.md
    │   ├── run.sh                               cron entry, hardcoded ts-node shim path
    │   ├── docs/
    │   │   ├── api-overview.md
    │   │   └── cdawgva-campaigns.md
    │   ├── output/, logs/, errors/              runtime, gitignored
    │   └── src/
    │       ├── fetch-donations.ts               main pipeline entry (IIFE, CommonJS)
    │       ├── build-stats.ts                   pipeline step, own npm script, require.main guard
    │       ├── build-donations.ts               DEPRECATED, dead code, broken ../../../webapp path
    │       ├── snapshot-by-date.ts               pipeline step, require.main guard
    │       ├── get-user-by-slug.ts               exploration script
    │       ├── get-user-campaigns.ts             exploration script
    │       ├── get-campaign.ts                   exploration script
    │       ├── get-campaign-stats.ts             exploration script
    │       ├── get-campaign-donations.ts         exploration script
    │       ├── auth.ts                           OAuth token helper
    │       ├── client.ts                         typed openapi-fetch client factory
    │       ├── r2.ts                             R2 upload/download helper
    │       ├── setup.ts                          bootstrap (env + auth)
    │       ├── constants.ts                      API URLs, campaign IDs, OUTPUT_DIR
    │       ├── types.ts                          SavedDonation, DonationsSnapshot
    │       ├── types/api.ts                      generated OpenAPI types
    │       └── utils.ts                          formatTimestamp (duplicated in page-scrap)
    └── tiltify-page-scrap/                       superseded Playwright scraper, own package.json
        ├── .gitignore / .prettierrc / .tool-versions / eslint.config.mjs / tsconfig.json
        ├── package.json / package-lock.json / node_modules/
        ├── README.md
        ├── run.sh                               cron entry, hardcoded ts-node shim path
        ├── output/, logs/, errors/              runtime, gitignored
        └── src/
            ├── index.ts                          entry point (IIFE, CommonJS)
            ├── scraper.ts                        Playwright page-scraping logic
            ├── storage.ts                        writes donations to output/
            ├── constants.ts                      TARGET_URL, MAX_PAGES, OUTPUT_DIR
            ├── types.ts                          Donation interface
            └── utils.ts                          formatTimestamp (duplicated in tiltify-api)
```

## Old path → new path mapping (reference for updating anything that still points at the old layout)

| Old path | New path |
| --- | --- |
| `scripts/tiltify-api/.env` | `.env` |
| `scripts/tiltify-api/.env.example` | `.env.example` |
| `scripts/tiltify-api/package.json` + `scripts/tiltify-page-scrap/package.json` | `package.json` (merged) |
| `scripts/tiltify-api/tsconfig.json` + `scripts/tiltify-page-scrap/tsconfig.json` | `tsconfig.json` (merged) |
| `scripts/tiltify-api/eslint.config.mjs` (= page-scrap's, identical) | `eslint.config.mjs` |
| `scripts/tiltify-api/.prettierrc` (= page-scrap's, identical) | `.prettierrc` |
| `scripts/tiltify-api/.tool-versions` / `scripts/tiltify-page-scrap/.tool-versions` | deleted, root `.tool-versions` already existed |
| `scripts/tiltify-api/docs/api-overview.md` | `docs/api-overview.md` |
| `scripts/tiltify-api/docs/cdawgva-campaigns.md` | `docs/cdawgva-campaigns.md` |
| `scripts/tiltify-api/README.md`, `scripts/tiltify-page-scrap/README.md` | content folded into root `README.md`/`docs/`, files deleted |
| `scripts/tiltify-api/run.sh` | `bin/run-fetch-donations.sh` |
| `scripts/tiltify-page-scrap/run.sh` | `bin/run-scrape-live-donations.sh` |
| `refresh.sh` (root) | `bin/refresh.sh` |
| `backup-r2.sh` (root) | `bin/backup-r2.sh` |
| `scripts/tiltify-api/src/fetch-donations.ts` | `scripts/fetch-donations.ts` |
| `scripts/tiltify-api/src/build-stats.ts` | `scripts/build-stats.ts` |
| `scripts/tiltify-api/src/build-donations.ts` | **deleted** (dead code, see Context) |
| `scripts/tiltify-api/src/snapshot-by-date.ts` | `scripts/snapshot-by-date.ts` |
| `scripts/tiltify-api/src/get-user-by-slug.ts` | `scripts/get-user-by-slug.ts` |
| `scripts/tiltify-api/src/get-user-campaigns.ts` | `scripts/get-user-campaigns.ts` |
| `scripts/tiltify-api/src/get-campaign.ts` | `scripts/get-campaign.ts` |
| `scripts/tiltify-api/src/get-campaign-stats.ts` | `scripts/get-campaign-stats.ts` |
| `scripts/tiltify-api/src/get-campaign-donations.ts` | `scripts/get-campaign-donations.ts` |
| `scripts/tiltify-api/src/auth.ts` | `scripts/lib/auth.ts` |
| `scripts/tiltify-api/src/client.ts` | `scripts/lib/client.ts` |
| `scripts/tiltify-api/src/r2.ts` | `scripts/lib/r2.ts` |
| `scripts/tiltify-api/src/setup.ts` | `scripts/lib/setup.ts` |
| `scripts/tiltify-api/src/constants.ts` | `scripts/lib/constants.ts` |
| `scripts/tiltify-api/src/types.ts` | `scripts/lib/types.ts` |
| `scripts/tiltify-api/src/types/api.ts` | `scripts/lib/types/api.ts` |
| `scripts/tiltify-api/src/utils.ts` + `scripts/tiltify-page-scrap/src/utils.ts` | `scripts/lib/format-timestamp.ts` (merged, byte-identical) |
| `scripts/tiltify-page-scrap/src/index.ts` | `scripts/scrape-live-donations.ts` |
| `scripts/tiltify-page-scrap/src/scraper.ts` | `scripts/lib/scrape-scraper.ts` |
| `scripts/tiltify-page-scrap/src/storage.ts` | `scripts/lib/scrape-storage.ts` |
| `scripts/tiltify-page-scrap/src/constants.ts` | `scripts/lib/scrape-constants.ts` |
| `scripts/tiltify-page-scrap/src/types.ts` | `scripts/lib/scrape-types.ts` |
| `scripts/tiltify-api/output/` + `scripts/tiltify-page-scrap/output/` | `data/output/` |
| (none — new) | `data/inbox/` (scaffolded, unused) |
| `scripts/tiltify-api/logs/`, `scripts/tiltify-api/errors/`, `scripts/tiltify-page-scrap/logs/`, `scripts/tiltify-page-scrap/errors/` | root `logs/`, `errors/` (already existed, now the only copies) |

## Target structure

```
package.json                        single root package, "type": "module"
package-lock.json
tsconfig.json                       nodenext, noEmit, allowImportingTsExtensions
eslint.config.mjs                   single flat config (merged from the two identical copies)
.prettierrc
.tool-versions                      unchanged (nodejs 24.14.1) — just dedup to one copy
.env.example                        moved from scripts/tiltify-api/.env.example
.env                                moved from scripts/tiltify-api/.env (gitignored, has real secrets)
.gitignore                          add node_modules/, data/ (wholesale, like manga-sync-v2); logs/, errors/, backups/ already present
bin/
  refresh.sh                        moved+adapted from root refresh.sh (manual local trigger)
  backup-r2.sh                      moved+adapted from root backup-r2.sh
  run-fetch-donations.sh            moved+adapted from scripts/tiltify-api/run.sh
  run-scrape-live-donations.sh      moved+adapted from scripts/tiltify-page-scrap/run.sh
docs/
  overview.md                       structure tree + architecture updated
  getting-started.md                install/run instructions updated for root package
  api-overview.md                   moved from scripts/tiltify-api/docs/
  cdawgva-campaigns.md              moved from scripts/tiltify-api/docs/
scripts/
  fetch-donations.ts                main pipeline entry (has npm script)
  build-stats.ts                    pipeline step + own npm script (imported by fetch-donations.ts)
  snapshot-by-date.ts                pipeline step, standalone-runnable (imported by fetch-donations.ts)
  get-user-by-slug.ts               exploration script
  get-user-campaigns.ts             exploration script
  get-campaign.ts                   exploration script
  get-campaign-stats.ts             exploration script
  get-campaign-donations.ts         exploration script
  scrape-live-donations.ts          entry script, was tiltify-page-scrap/src/index.ts
  lib/
    format-timestamp.ts             shared util, dedup'd from both projects' utils.ts
    constants.ts                    was tiltify-api/src/constants.ts
    types.ts                        was tiltify-api/src/types.ts
    types/api.ts                    generated OpenAPI types, was tiltify-api/src/types/api.ts
    auth.ts                         was tiltify-api/src/auth.ts
    client.ts                       was tiltify-api/src/client.ts
    setup.ts                        was tiltify-api/src/setup.ts
    r2.ts                           was tiltify-api/src/r2.ts
    scrape-constants.ts             was tiltify-page-scrap/src/constants.ts
    scrape-types.ts                 was tiltify-page-scrap/src/types.ts
    scrape-scraper.ts               was tiltify-page-scrap/src/scraper.ts
    scrape-storage.ts               was tiltify-page-scrap/src/storage.ts
data/                                gitignored wholesale (not committed, created at runtime)
  output/                           local run snapshots (was per-project output/)
  inbox/                            scaffolded for future user-provided input files (unused for now)
logs/, errors/                      already exist at root, now the only copies, created at runtime
```

Everything under `scripts/tiltify-api/` and `scripts/tiltify-page-scrap/` (including their `node_modules`, `package-lock.json`, `dist`, `.tool-versions`, `.prettierrc`, `eslint.config.mjs`, per-project `logs/`/`errors/`/`output/`, and `README.md`) is deleted once content is migrated. `build-donations.ts` is dropped entirely (not migrated).

## package.json (root)

Merge dependencies (no version conflicts between the two):
- `dependencies`: `@aws-sdk/client-s3`, `dotenv`, `openapi-fetch`, `playwright`
- `devDependencies`: `@eslint/js`, `@types/node`, `eslint`, `eslint-config-prettier`, `eslint-plugin-import`, `openapi-typescript`, `prettier`, `typescript`, `typescript-eslint`
- Drop `ts-node` (no longer used) and `globals` (manga-sync-v2's config doesn't need it — `typescript-eslint`'s recommended config already turns off `no-undef`; verify via lint run, fall back to keeping `globals.node` in `languageOptions` if `console`/`process`/`fetch` trigger false positives)

Scripts, following the `node --disable-warning=ExperimentalWarning scripts/<file>.ts` pattern (dropping the old `NODE_NO_WARNINGS=1` blanket env var in favor of the targeted flag):
```
"lint": "eslint .",
"lint:fix": "eslint . --fix",
"format": "prettier --write .",
"format:check": "prettier --check .",
"typecheck": "tsc --noEmit",
"check": "npm run format && npm run lint:fix && npm run typecheck",
"generate:types": "openapi-typescript https://v5api.tiltify.com/api/public/openapi -o scripts/lib/types/api.ts",
"fetch-donations": "node --disable-warning=ExperimentalWarning scripts/fetch-donations.ts",
"build-stats": "node --disable-warning=ExperimentalWarning scripts/build-stats.ts",
"get-user-by-slug": "node --disable-warning=ExperimentalWarning scripts/get-user-by-slug.ts",
"get-user-campaigns": "node --disable-warning=ExperimentalWarning scripts/get-user-campaigns.ts",
"get-campaign": "node --disable-warning=ExperimentalWarning scripts/get-campaign.ts",
"get-campaign-stats": "node --disable-warning=ExperimentalWarning scripts/get-campaign-stats.ts",
"get-campaign-donations": "node --disable-warning=ExperimentalWarning scripts/get-campaign-donations.ts",
"scrape-live-donations": "node --disable-warning=ExperimentalWarning scripts/scrape-live-donations.ts"
```
No `build`/`start` scripts (no dist step anymore, matching manga-sync-v2).

## tsconfig.json (root)

Model on manga-sync-v2's, adjusted for `include`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "incremental": true
  },
  "include": ["scripts/**/*.ts"],
  "exclude": ["node_modules"]
}
```
(`DOM` lib kept because the scrape scripts use Playwright's page-evaluated DOM types; drop it if typecheck doesn't need it.) `noUncheckedIndexedAccess` from manga-sync-v2 is intentionally **not** adopted here — out of scope for a structural move, would require auditing array-index usage across the pipeline for a separate pass.

## eslint.config.mjs / .prettierrc (root)

Single merged copy of the current (identical) configs, plus one addition to match what `CLAUDE.md` already claims is enforced:
```js
'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
```
This is autofixable — running `npm run lint:fix` after the file move will convert type-only imports (e.g. `import { SavedDonation } from './lib/types.ts'` used only as a type) automatically; no need to hand-convert each one.

`.prettierrc` is byte-identical between the two sub-projects today — keep as-is at root.

## Code changes needed during the move (pattern-level, not file-by-file)

- **CommonJS → ESM idioms**: replace `__dirname` with `import.meta.dirname` (Node 24 has this natively) where still needed; replace `if (require.main === module)` (in `build-stats.ts`, `snapshot-by-date.ts`) with `if (import.meta.url === \`file://${process.argv[1]}\`)`; drop the `(async () => { ... })()` IIFE wrappers in entry scripts in favor of top-level `await` (matches `manga-sync-v2`'s style).
- **Import extensions**: all relative imports need an explicit `.ts` extension (`nodenext` requirement), e.g. `from './lib/setup.ts'`.
- **Path resolution for local data**: `OUTPUT_DIR` in `scripts/lib/constants.ts` and `scripts/lib/scrape-constants.ts` currently computed as `path.join(__dirname, '..', 'output')` relative to each sub-project. Repoint both to a single shared root `data/output/` dir — since npm scripts always run with `cwd` = the directory containing `package.json`, use `path.join(process.cwd(), 'data', 'output')` rather than an `__dirname`-relative walk.
- **Dedup `formatTimestamp`**: both `utils.ts` files are byte-identical — collapse into `scripts/lib/format-timestamp.ts`, update the handful of importers.
- **`.env` loading**: `dotenv/config` loads from `cwd` by default, which will now correctly be the repo root once invoked via `npm run ...` or the updated `bin/` scripts — no code change needed beyond moving the physical `.env`/`.env.example` files.

## Shell scripts (→ bin/) & CI

All four scripts move into `bin/` and need their `$DIR` resolution updated to walk up one extra level to reach the repo root (since they no longer live at root themselves):
```bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
```
- `bin/run-fetch-donations.sh` (was `scripts/tiltify-api/run.sh`): drop the hardcoded `/Users/travis/.asdf/shims/ts-node` call, replace with `cd "$ROOT_DIR" && npm run fetch-donations`; lock file becomes `$ROOT_DIR/.run-fetch-donations.lock`; logs/errors write to `$ROOT_DIR/logs/`/`errors/`.
- `bin/run-scrape-live-donations.sh` (was `scripts/tiltify-page-scrap/run.sh`): same treatment, `npm run scrape-live-donations`.
- `bin/refresh.sh` (was root `refresh.sh`): update to `cd "$ROOT_DIR" && npm run fetch-donations`.
- `bin/backup-r2.sh` (was root `backup-r2.sh`): `ENV_FILE="$ROOT_DIR/.env"`.
- `.github/workflows/refresh.yml`: drop `working-directory: scripts/tiltify-api` from both steps (defaults to repo root), update `cache-dependency-path` to `package-lock.json`. (This workflow calls `npm run fetch-donations` directly, not through `bin/`, so it's unaffected by the `bin/` move itself.)
- **Manual follow-up for the user (cannot be done from inside the repo)**: any real system crontab/launchd entry pointing at the old `refresh.sh`, `backup-r2.sh`, or either `run.sh` path needs to be updated to the new `bin/` paths after this merge lands.

## Docs

- `docs/overview.md`: architecture diagram's `fetch-donations.ts` reference stays conceptually the same, just no longer nested under `tiltify-api/`.
- `docs/getting-started.md`: installation becomes `npm install` at root (no `cd scripts/tiltify-api`), update the full "Project structure" tree to reflect `scripts/`, `scripts/lib/`, `bin/`, `data/`, update `.env.example` copy path to root, update the available-scripts table to match the merged `package.json`.
- Move `scripts/tiltify-api/docs/{api-overview.md,cdawgva-campaigns.md}` → root `docs/`.
- Fold useful content from `scripts/tiltify-api/README.md` and `scripts/tiltify-page-scrap/README.md` (R2 output shape table, exploration-scripts list, scrape usage/scheduling notes) into the root `README.md` / `docs/`, then delete both sub-READMEs.

## Cleanup

Delete entirely: `scripts/tiltify-api/` and `scripts/tiltify-page-scrap/` directory trees (node_modules, dist if present, per-project output/logs/errors, package-lock.json, .tool-versions, .prettierrc, eslint.config.mjs, README.md) — after their content has been migrated per the mapping above. Delete root `refresh.sh`/`backup-r2.sh` after copying into `bin/`. Root `.gitignore` gains `node_modules/` and `data/` (wholesale ignore, like manga-sync-v2 — no `.gitkeep` needed, dirs are created at runtime via `fs.mkdirSync`).

## Verification

1. `npm install` at root succeeds, single `node_modules`/`package-lock.json`.
2. `npm run check` (format + lint:fix + typecheck) passes clean.
3. `npm run fetch-donations` runs against real `.env` credentials and completes a full pipeline cycle (fetch → merge → upload to R2 → stats → snapshots) without errors — confirms ESM conversion, `import.meta.dirname`/`process.cwd()` paths, and R2 upload all still work.
4. `npm run get-user-by-slug` (cheapest exploration script) runs cleanly as a smoke test for the other exploration scripts' shared pattern.
5. `npm run scrape-live-donations` (requires `npx playwright install chromium` first) runs and produces a timestamped file under `data/output/`.
6. `bin/run-fetch-donations.sh` and `bin/refresh.sh` run successfully from a fresh shell (not just via `npm run`), confirming the `ROOT_DIR` path-walking fix works.
7. Confirm `git status` shows the two old sub-project directories removed and no leftover `node_modules` tracked.

## Commit policy (per AGENTS.md)

Do not commit. After implementation, stage changes and show `git diff --stat`, then wait for explicit confirmation. If/when approved, use a single-line conventional commit (e.g. `refactor: consolidate scripts into single root package`), no body, no `Co-Authored-By` line.
