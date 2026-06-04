# Premonition — project instructions for Claude

## ⚠️ Before ANY code-related work: verify the repo is current

This repo has a **GitHub Action that auto-commits data to `origin/main` daily**
(`.github/workflows/update-standings.yml`). The local clone goes stale fast — in one
session local `main` was **77 commits / ~2.5 months behind** `origin/main`, which led
to reasoning and edits against frozen, out-of-date data.

**So, at the start of any code- or data-related task — before reading state, drawing
conclusions, branching, or editing — confirm you're on current code:**

1. `git fetch` and compare the local branch to its upstream:
   `git status -sb` and `git rev-list --left-right --count @{u}...HEAD`
2. If **behind**: stop and reconcile (`git pull` / review) before doing work — don't
   build on stale code or reason about "what's live" from a stale tree.
3. Treat **`origin/main` as the source of truth** for what's deployed, not the local
   working copy. The committed `public/version.json` is also stale by design
   (regenerated at build time), so don't read "live" state from it.
4. A SessionStart hook (`scripts/git-sync-check.sh`) reports sync status automatically,
   but verify explicitly anyway before code work — don't rely on memory.

Also worth a quick check when relevant: that the Claude Code CLI itself is current
(`claude --version` / `claude update`).

## Safety rules specific to this project

- **Live phase is the leaderboard.** The active phase is set by the build-time env var
  `VITE_APP_MODE` in Vercel (default `dashboard`). NEVER set it to `prediction` in
  production or change the `App.jsx` branch default — that would flip the live site out
  of the leaderboard. Exercise the input phase locally only
  (`VITE_APP_MODE=prediction npm run dev`).
- **Pushing `main` deploys to production** (Vercel auto-deploy). Don't `git push`
  without explicit confirmation.
- **The season's results are sacred.** `standingsByGameweek.json`, `scoresByGameweek.json`,
  and the predictions feed the displayed leaderboard. Don't alter the numbers; the
  `scoreIntegrity.test.js` golden record must pass after any change.

## Verify, don't assert

Before claiming work is done/committed/passing, run the command that proves it
(`git status`, `git log`, the test suite) and show the result — evidence first.

## Working context

See `DESIGN_PLAN.md` for the full revamp audit, the phased plan, and the next-session
TODO list (major UI fix + optimization).
