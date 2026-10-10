# Multi-event R2 bucket, live/archive pipeline split

Status: done, as far as this repo is concerned. Code landed in `66fdcc0`. The operator created the
real `cdawgva` R2 bucket, put its credentials in `.env`, and `archive-event` has been run with
`DATA_STORE=r2` for all five events against that real bucket, verified by direct download (see
`.ai/journal/2026/2026-10-10.md` for the per-event donation counts and totals). The GitHub Actions
secrets `R2_ACCESS_KEY_ID`, `R2_BUCKET_NAME`, and `R2_SECRET_ACCESS_KEY` have since been updated to
match (`R2_ACCOUNT_ID` unchanged, correctly, since the Cloudflare account itself didn't change).
Pointing the web app (`cdawgva-cyclethon-app`) at the new bucket/key layout was always out of scope
for this repo (see the rollout order below) and the operator is tracking it as a separate task in
that repo.

## Context

The pipeline is currently hardcoded to Cyclethon 5 and one flat-namespace R2 bucket (`cc5`):
`fetch-donations.ts` and `build-stats.ts` both import `CYCLETHON_5_CAMPAIGN_ID` directly,
`snapshot-by-date.ts` uses a single global `EVENT_START`/`EVENT_END`, and `r2-keys.ts` produces
bucket-root keys like `donations-full.json` with no event prefix.

Goal: move to a new bucket `cdawgva` that holds every event (past and future, cyclethon or not)
under a per-event key prefix, and split the "fetch" concept into two scripts: a recurring **live**
pipeline for whichever event is currently running, and a one-shot **archive** pipeline for
backfilling a completed event's full history. No backward compatibility with `cc5` needed, the
operator will update the companion web app (`cdawgva-cyclethon-app`) separately to read from the new
bucket/keys.

As of 2026-10-10, Cyclethon 5 has already ended (its event window was 2026-04-05 to 2026-04-19 JST)
and no event is currently live.

## Decisions confirmed with the operator

- Storage keys are prefixed per event: `` `${eventKey}/donations-full.json` ``, etc. (not a flat
  filename suffix, not a `live/`/`archive/` top-level split).
- The event key is a canonical identifier we define ourselves (`'cyclethon-1'`..`'cyclethon-5'`),
  decoupled from Tiltify's real campaign slug, since the real slugs for events 1-4 aren't
  `cyclethon-N` (e.g. `connors-500-mile-cyclethon`) and a future non-cyclethon event wouldn't have
  one at all.
- Archive is a one-shot full backfill: fetch everything once, write full history + stats, not
  scheduled.
- The live pipeline reads which campaign is "current" from a single config pointer
  (`CURRENT_LIVE_EVENT_KEY`) that gets updated manually per event, rather than a workflow input.
  That pointer can be `null` (no event live), which is the actual current state.
- Archive output also includes `latest-100`/`latest-500` slices, even though nothing polls a
  finished event live. Keeps output shape consistent across events and leaves the option open for
  the web app.
- No new GitHub Actions workflow for archiving. `refresh.yml`'s real trigger is cron-job.org calling
  its `workflow_dispatch` endpoint externally (the native `on.schedule` cron block in the file is
  vestigial). Archiving happens locally: run the script with `DATA_STORE=r2`, upload directly, done.
- `bin/backup-r2.sh` is dropped entirely rather than updated. It can be rebuilt in a different shape
  later if needed.

## File-level plan

### `scripts/lib/campaign.ts`

- Rename `CyclethonCampaign` to `DonationEvent`, `CYCLETHON_CAMPAIGNS` to `EVENTS`.
- Each entry: `key` (canonical), `name`, `slug` (Tiltify's real slug, kept only for human lookup and
  the exploration scripts), `campaignId`, `status: 'archived' | 'live'`.
- Mark all five existing entries `status: 'archived'`, Cyclethon 5 included.
- Move `EVENT_START`/`EVENT_END` off the global scope onto the live event only, e.g. a `liveWindow:
{ start, end }` field present only when `status === 'live'`. Archive does not need hardcoded dates,
  see the archive-event section below.
- Add `export const CURRENT_LIVE_EVENT_KEY: string | null = null`, the single pointer flipped when a
  new event goes live.

### `scripts/lib/r2-keys.ts`

- All builders take `eventKey` as the first param and prefix the existing filename, e.g.
  `` `${eventKey}/donations-full.json` ``, through `latest-100`, `latest-500`, `stats`, and the
  per-date snapshot key.
- No change needed in `local-store.ts`, it already does `path.join(OUTPUT_DIR, key)`, so a key
  containing `/` nests into a subdirectory automatically.

### `scripts/build-stats.ts` / `scripts/snapshot-by-date.ts`

- Convert both to exported functions taking `(eventKey, campaignId)` instead of importing
  `CYCLETHON_5_CAMPAIGN_ID` directly, so both the live and archive scripts can call them for any
  event.
- `snapshot-by-date.ts`'s "only snapshot completed days" check needs an explicit start/end window for
  the live script (pass the live event's `liveWindow`). The archive script does not need one, see
  below.

### New `scripts/archive-event.ts`

- CLI: `npm run archive-event -- <event-key>`.
- Refuses to run if `EVENTS[event-key].status !== 'archived'` (guardrail against archiving the live
  event mid-event).
- Fetches the entire donation history in one pass, no `since`/incremental merge, just paginate
  everything.
- Writes `full.json` + `stats.json` under the event's key prefix.
- Also writes `latest-100.json` + `latest-500.json` for output-shape consistency with the live
  pipeline.
- Also writes daily `donations-YYYY-MM-DD.json` snapshots, deriving the day range from
  `min(completed_at)`/`max(completed_at)` in the fetched donations themselves (JST), so there is no
  need to track down each historical event's real start/end dates.
- Not scheduled anywhere. Run manually, locally, with `DATA_STORE=r2`.

### `scripts/fetch-donations.ts`

- Reads `campaignId` from `EVENTS[CURRENT_LIVE_EVENT_KEY]` instead of the hardcoded
  `CYCLETHON_5_CAMPAIGN_ID` constant.
- If `CURRENT_LIVE_EVENT_KEY` is `null`, logs clearly and exits 0 (no-op, not a failure, this is the
  expected state between events).
- Otherwise unchanged logic: incremental fetch/merge/dedup, writes `full` + `latest-100` +
  `latest-500` + `stats` + completed-day snapshots, all through the new prefixed keys.

### GitHub Actions

- `refresh.yml` needs no structural change beyond updating the `R2_BUCKET_NAME` secret value to
  `cdawgva` when cutting over.
- Optional, not required for this task: consider removing the redundant `on.schedule` block since
  cron-job.org is the actual trigger.
- No `archive-event.yml`.

### Housekeeping

- Delete `bin/backup-r2.sh`.
- `.env.example`: update the R2 bucket comment/example to `cdawgva`.
- `docs/overview.md`: architecture diagram and output-files table need to reflect per-event key
  prefixes and the live/archive script split.
- `docs/getting-started.md`: add `archive-event` to the commands table, update bucket name
  references.
- `README.md`: add `npm run archive-event -- <event-key>` to the "Other Commands" section.

## Rollout order

1. Land the registry/key/script changes above, run `npm run check`.
2. Create the `cdawgva` R2 bucket in Cloudflare, update `.env` and GitHub Actions secrets.
3. Run `archive-event` locally (`DATA_STORE=r2`) for `cyclethon-1` through `cyclethon-5`.
4. Point the web app at the new bucket/keys (tracked in `cdawgva-cyclethon-app`, not this repo).
5. When a new event goes live: add its entry to `EVENTS` with `status: 'live'` and a `liveWindow`,
   set `CURRENT_LIVE_EVENT_KEY` to its key, resume cron-job.org hitting `refresh.yml`.
6. When that event ends: flip its `status` to `'archived'`, set `CURRENT_LIVE_EVENT_KEY` back to
   `null`, run `archive-event` for it once.

## Open items

- `archive-event.ts`'s guard against running on a `'live'` event is implemented (exits 1 with a clear
  message); still not explicitly confirmed with the operator as a hard requirement, just the default
  assumption this was built on.

## Commit policy (per AGENTS.md)

Do not commit. After implementation, stage changes and show `git diff --stat`, then wait for
explicit confirmation. If approved, use a single-line conventional commit, no body, no
`Co-Authored-By` line.
