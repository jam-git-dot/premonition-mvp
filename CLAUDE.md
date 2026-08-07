# Premonition — project instructions for Claude

## What this is

A Premier League prediction league for ~24 friends. Players rank all 20 teams before the
season; each gameweek they score the sum of `|predicted position − actual position|`
across the 20 teams. **Lower is better.** A GitHub Action pulls standings daily, scores
every player, commits the result, and Vercel redeploys.

**Stack:** React 19 + Vite 7 + Tailwind 3 + Supabase (predictions) + Vitest. No TypeScript.

**Status: the 2025/26 season is complete (GW 1–38) and this repo is in maintenance mode.**
New feature work happens in the v2 repo — see `docs/V2_FOUNDATION.md`. Here, prefer the
smallest change that keeps the live leaderboard correct. Don't start refactors.

## Commands

| Task | Command | Notes |
|---|---|---|
| Dev server | `npm run dev` | Vite, prints its port (usually 5173) |
| **Tests** | **`npm run test:run`** | **`npm test` is watch mode — it will hang. Never use it non-interactively.** |
| Lint | `npm run lint` | See baseline below |
| Build | `npm run build` | |
| System health | `npm run health-check` | Validates data files, gaps, score accuracy, env vars |
| Recalculate scores | `npm run recalculate-scores [gw]` | Repair tool — see safety rules |

**Known baseline — do not "fix" these as a side quest:** `npm run lint` reports
**65 pre-existing errors** (e.g. `no-undef __dirname` in `vite.config.js`). `npm run test:run`
passes **26 tests in 2 files**. If you see those numbers, nothing is broken. If a change of
yours moves them, that's yours to fix.

## Safety rules

These are the rules that have actually bitten. Treat them as hard constraints.

- **Live phase is the leaderboard.** The phase is chosen at build time:
  `App.jsx:16` → `const appMode = import.meta.env.VITE_APP_MODE || 'dashboard'`, branching at
  `App.jsx:133`. NEVER set `VITE_APP_MODE=prediction` in Vercel and never change that default —
  it would flip the live site out of the leaderboard. Exercise the input phase locally only:
  `VITE_APP_MODE=prediction npm run dev`.
- **Pushing `main` deploys to production** (Vercel auto-deploy), which is what gives the
  global no-push-without-confirmation rule real teeth here.
- **The season's results are immutable.** `src/data/standingsByGameweek.json`,
  `src/data/scoresByGameweek.json`, and the predictions in `src/data/competitionData.js` are a
  finished historical record. Don't edit the numbers. `src/data/scoreIntegrity.test.js` is a
  golden-record snapshot and must pass after any change — if it fails, you changed history,
  so revert rather than updating the snapshot.
- **The Supabase anon key in the client bundle is fine** — public by design and RLS-protected.
  It's the one exception to the global no-credentials-in-code rule; nothing else is.

## Repo is auto-committed — check you're current

A GitHub Action (`.github/workflows/update-standings.yml`, daily 03:00 UTC) commits data
straight to `origin/main`. A local clone once drifted **77 commits behind**, and work got done
against frozen data. `origin/main` is the source of truth for what's live, not your working
copy — and `public/version.json` is generated at build time, so never read live state from it.

A SessionStart hook (`scripts/git-sync-check.sh`) reports sync status, but before code or data
work, confirm it yourself: `git fetch && git status -sb`. If behind, reconcile before doing
anything else.

## Working here

How I like to work generally — push back, plan before coding, verify before claiming done —
lives in my global `~/.claude/CLAUDE.md`. Only the project-specific additions are here:

- After a change I'd want to look at, run `npm run dev`, confirm it's actually serving, and
  tell me explicitly that you did.
- **Explain the why**, briefly, when you use a pattern I might not know.

## Quality gates

- **Scoring / data logic → tests are mandatory.** No exceptions. This is the part that must
  never silently break.
- **UI components → tests optional.** Working and responsive on mobile + desktop is the bar.
- **External APIs → error handling and secured credentials are mandatory;** consider rate limits.
- **User input → validation is mandatory.**
- **No emojis in UI** unless I approve them. (The leaderboard and week-comparison views already
  use some — those are grandfathered in.)

## Architecture

Read `ARCHITECTURE.md` for the full data flow. The one rule that matters:
**every piece of data has exactly one authoritative source, and the frontend never recalculates
scores.** It reads `scoresByGameweek.json` and fails loudly if data is missing. Don't add
fallback calculations — a previous version did that and it masked automation failures.

```
src/components/   UI (CompetitionDashboard.jsx is the live leaderboard, 433 lines)
src/data/         Standings, scores, predictions, and their tests
src/hooks/        useCompetitionData.js loads everything
src/lib/          Supabase client, theme
scripts/          Automation: update-standings.js, health-check.js, recalculate-scores.js
```

## Gotchas

- **`scripts/*.js` is canonical.** The root-level `update-standings.cjs`, `regenerate-scores.cjs`,
  and `compare-weeks.cjs` are dead duplicates from an earlier layout. Don't edit or run them;
  they're safe to delete.
- **Confirmed dead code** (zero references outside their own files): `ModeToggle`,
  `ProminentButton`, `GroupToggle`, `SubmitForm`, `useDragAndDrop`, `src/data/predictions.js`.
- **`scoresByGameweek.json` is 2.8 MB and is bundled into the client.** Don't make it worse;
  fixing it properly is a v2 concern.
- Line numbers in docs rot. If a reference here doesn't match, trust the code and fix the doc.

## Docs map

| File | What it's for |
|---|---|
| `ARCHITECTURE.md` | Data flow, single-source-of-truth rules, failure modes |
| `docs/V2_FOUNDATION.md` | Carrying this project into the v2 repo |
| `DESIGN_PLAN.md` | Revamp audit + phased UI/perf plan (historical) |
| `scripts/README.md`, `scripts/QUICK_START.md` | Automation operations |
| `scripts/MANUAL_OVERRIDE_GUIDE.md` | Fixing a bad gameweek by hand |
