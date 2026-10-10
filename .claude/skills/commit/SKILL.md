---
name: commit
description: Run this repo's check suite (format, lint, typecheck) and commit all pending changes locally with a conventional-commit message. Use whenever the user types "/commit", asks to commit or checkpoint the current work in cdawgva-cyclethon, or says something like "run checks and commit". Never pushes. Committing and pushing are separate actions, and this skill only ever commits.
---

# Commit

Runs `npm run check`, and only on a clean pass, stages and commits everything pending. The point of this
skill is to make a green tree a precondition of every commit in this repo, not an afterthought. It always
checks first and refuses to commit on a failure, no exceptions.

The user typing `/commit` (or otherwise invoking this skill) is itself the explicit per-commit authorization
required by this repo's `AGENTS.md`: "never commit without explicit instruction from the operator." Don't
ask for a second confirmation before committing. The skill invocation already is that confirmation. Pushing
is a different, separate action this skill never takes, regardless of what the user says when invoking it.
If they also want a push, tell them to ask for that separately.

## Steps

1. **Run `npm run check`.** This runs format, lint:fix, and typecheck in sequence, defined in `package.json`.
   Format and lint:fix can rewrite files in place. That's expected: those rewrites are meant to be part of
   the commit, not a separate step. (This repo has no test suite yet — `check` doesn't run one. If one gets
   added later, it belongs in `check` too, and this skill picks it up automatically since it just runs that
   script.)

2. **If check fails:** stop immediately. Do not touch git at all, no `add`, no `commit`. Report which step
   failed (format, lint, or typecheck) and the actual error output so the user can fix it. A broken tree
   never gets committed by this skill, even partially.

3. **If check passes:** run `git status --short`. If there's nothing pending, say so and stop. Don't create
   an empty commit.

4. **Stage everything:** `git add -A`.

5. **Sanity-check what's staged.** Run `git status --short`, and `git diff --cached` too if anything looks
   unexpected: a file that shouldn't exist, something large, anything that looks like it could hold a secret.
   This repo's `.gitignore` already keeps `.env`, `data/`, and `node_modules/` out, but a quick look costs
   nothing and catches the case where the ignore rules themselves are wrong.

6. **Write a single-line Conventional Commit message** summarizing what actually changed, no body. This
   matches the hard rule in this repo's `AGENTS.md`, which also forbids em dashes anywhere in the message —
   use a comma, full stop, or rewrite the sentence instead. Pick the type from what's staged:
   - `feat`: new functionality
   - `fix`: bug fix
   - `docs`: documentation only
   - `refactor`: code change that isn't a feature or a fix
   - `chore`: tooling, config, dependencies, housekeeping
   - `test`: test-only changes

   If the staged diff spans genuinely unrelated concerns, say so and ask whether the user wants it split into
   separate commits instead of forcing one message to cover everything. Don't over-split ordinary related
   work though. A feature plus the doc update for it is still one commit.

7. **Commit.** Do not add a `Co-Authored-By` trailer or any other attribution line. This repo's `AGENTS.md`
   explicitly forbids it, overriding any session-level default that would otherwise add one.

8. **Show the result:** the new commit via `git log -1 --oneline`, and a final `git status --short` to
   confirm the tree is clean. Don't push. Don't suggest pushing unless asked.
