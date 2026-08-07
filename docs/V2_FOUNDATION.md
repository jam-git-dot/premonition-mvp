# Premonition v2 — foundation notes

Written 2026-08-07, at the end of the 2025/26 season, while deciding to build v2 in a fresh
repo rather than evolving `premonition-mvp`.

This is not a feature plan. It's the set of decisions worth making **before** the first line of
v2 code, because each one is expensive to reverse later — plus what to port from the MVP and
what to deliberately leave behind.

---

## 1. What the MVP got right (port these)

**The golden-record score test.** `src/data/scoreIntegrity.test.js` snapshots real computed
scores, so any change to scoring logic that alters historical results fails loudly. This is the
single best thing in the repo. Build it in v2 on day one, before the scoring code has any
users — a scoring bug found in month six is unfixable, because you can't tell players their
past rankings were wrong.

**Single source of truth, fail loudly.** `ARCHITECTURE.md` documents the v1→v2 lesson: the
first version calculated scores in the frontend as a fallback when the data file was missing,
which silently masked automation failures and gave different users different numbers. Removing
the fallback was the right call. Keep the principle: one authoritative source per fact, and
missing data throws instead of degrading.

**The scoring rule itself.** Sum of `|predicted − actual|` over 20 teams, lower is better. It's
simple, explainable, and has a full season of results behind it. Don't redesign it casually.

**A health check that independently recalculates.** `scripts/health-check.js` verifies data
integrity by recomputing a spot-check gameweek rather than trusting stored values. That's a
genuinely good pattern.

**Discord notifications on automation events.** Cheap, and it's how you found out when things
broke.

---

## 2. What to leave behind (and why)

**Data stored in git.** This is the big one. The MVP commits `standingsByGameweek.json` and
`scoresByGameweek.json` to `main` on a daily cron, which causes, in order of severity:

- Your local clone silently goes stale — it once drifted 77 commits / ~2.5 months behind, and
  real work got done against frozen data.
- Every data update triggers a full production redeploy.
- `scoresByGameweek.json` reached **2.8 MB and ships inside the client bundle**, so every
  visitor downloads the entire season's scores to render one page.
- Data corrections rewrite git history rather than updating a row.

**In v2, standings and scores belong in Supabase**, not in the repo. The daily job writes rows;
the app queries the gameweeks it needs. This one change removes the stale-clone problem, the
bundle problem, and the redeploy-on-data-change problem simultaneously.

**Predictions hardcoded in source.** `competitionData.js` holds a literal `realPredictions`
array, so adding a player means a code change and a deploy. v2 reads predictions from Supabase.
The MVP already writes them there — it just never read them back.

**Build-time phase switching.** The MVP picks "prediction input" vs "leaderboard" from
`VITE_APP_MODE`, a build-time env var, which means changing phase requires a Vercel env edit
plus redeploy, and one wrong value takes the live site down. In v2 the phase should be data —
a season row with `predictions_open_until` — so it changes on a schedule with no deploy.

**Accumulated lint debt.** 65 errors right now, which is what happens without a gate. In v2,
lint and tests run in CI on every PR and merges are blocked on green.

**Doc sprawl.** Eleven markdown files with overlapping content, several stale enough to be
actively misleading (a "critical bug" reference whose line number now points at unrelated JSX;
advice to downgrade React 19 to 18, written when 19 was new and stable). v2 keeps `README.md`
(what and how to run), `CLAUDE.md` (how to work here), and `ARCHITECTURE.md` (how data flows).
Anything else needs a reason to exist.

---

## 3. Decisions to make before writing v2 code

These are ordered by cost-to-reverse. The first two are the ones that genuinely matter.

### a. Multi-season data model — decide now, it's the expensive one

The MVP's shape is `{ gameweek: { position: team } }`, with season implicit. v2 should make
season explicit everywhere from the start, because retrofitting a season dimension means
migrating every table, query, and URL at once.

Sketch:

```
seasons        (id, name, starts_at, predictions_open_until, status)
players        (id, display_name, email)
predictions    (id, season_id, player_id, rankings jsonb, submitted_at, locked)
standings      (season_id, gameweek, position, team)      -- one row per team per gameweek
scores         (season_id, gameweek, player_id, total_score, team_scores jsonb)
```

Then answer: does a player's identity persist across seasons (career stats, "you finished 3rd
last year"), or is each season standalone? Cross-season identity is a nice feature and nearly
free if `players` is separate from `predictions` from day one — and painful to add later.

### b. Are past seasons immutable?

Decide explicitly that finished seasons are read-only, and enforce it — a `status` column plus
an RLS policy or a database trigger, not just good intentions. The 2025/26 results are the
project's history. Guarantee they can't be edited by a bug in next season's code.

### c. TypeScript or not

You're doing this to learn, so this is a real choice, not a formality.

- **Plain JS + JSDoc** (what the MVP does, minus the neglect): zero setup cost, no build
  complexity, but nothing catches a typo'd field name until it's on screen.
- **TypeScript**: catches exactly the class of bug that hurts most here — a renamed field
  quietly producing `undefined` in a score calculation — and makes the data model self-
  documenting. Costs a real learning curve on top of everything else.

My recommendation: **TypeScript**, but only if you're up for the learning curve, because the
data model *is* this project and types make it legible. If that feels like too much at once,
plain JS with a strict lint config is a defensible choice — just decide deliberately rather
than defaulting.

### d. Where the daily job runs

The MVP uses a GitHub Action that commits to the repo. With data in Supabase, the options are
a GitHub Action writing to the DB (simplest, keeps current knowledge), a Supabase Edge Function
on a cron (no repo involvement, closest to the data), or a Vercel Cron route (fewest moving
parts if you're already on Vercel). Any is fine; pick one and don't split logic across two.

### e. Migrations from day one

The MVP has a schema documented in a README code block, which means the real schema lives only
in Supabase's dashboard and nothing can rebuild it. Use Supabase migrations, checked into the
repo, from the first table.

---

## 4. Repo setup checklist for v2

- [ ] `README.md` describing **both** phases and how to run each. (The MVP's README documents
      only the prediction input and never mentions the leaderboard — which is the live product.)
- [ ] `CLAUDE.md` from the template below, filled in as you go.
- [ ] Real `package.json` metadata — name, description, version. The MVP still carries the Vite
      template's `"This template provides a minimal setup…"` and `version: 0.0.0`.
- [ ] `.gitignore` covering env files and build output, but **not** blanket-ignoring `.claude/`
      (see below).
- [ ] Track `.claude/settings.json` (shared hooks and permissions) and `.claude/skills/`; ignore
      `.claude/settings.local.json`. In the MVP the whole directory is ignored, so the
      git-sync safety hook exists only on one machine and would vanish on a re-clone.
- [ ] `.env.example` with placeholders, committed.
- [ ] CI on every PR: `lint` + `test:run`, merges blocked on failure.
- [ ] `npm test` should be the CI-safe run, not watch mode. In the MVP `npm test` starts a
      watcher that hangs any non-interactive caller — name the watcher `test:watch` instead.
- [ ] Supabase RLS policies written and verified before any real data lands.
- [ ] Score-integrity golden-record test, committed alongside the first scoring code.

---

## 5. Starter `CLAUDE.md` for v2

Copy this in early and keep it current. Keep it short — a CLAUDE.md that grows past ~150 lines
stops being read carefully. Facts that rot (line numbers, file sizes, counts) either get
verified or get left out.

```markdown
# Premonition v2 — project instructions for Claude

## What this is
A Premier League prediction league. Players rank all 20 teams before the season; each
gameweek they score sum(|predicted position − actual position|) across 20 teams.
Lower is better. A daily job ingests standings and scores every player.

Stack: <fill in>. Data lives in Supabase, not in this repo.

## Commands
| Task | Command |
|---|---|
| Dev | `npm run dev` |
| Tests | `npm test` |
| Lint | `npm run lint` |
| Build | `npm run build` |

Baseline: lint clean, all tests passing. If that's not what you see, something is broken —
say so rather than working around it.

## Safety rules
- Never `git push` without explicit confirmation in the current conversation.
- Finished seasons are immutable. The score-integrity test is a golden record: if it fails,
  you changed history — revert rather than updating the snapshot.
- Never commit credentials, in any file, even a gitignored one.
- Predictions lock at the season's `predictions_open_until`. Never bypass the lock in code.

## How to work with me
I'm a mechanical engineer, not a professional programmer, doing this partly to learn.
- Push back. If an idea is wrong or risky, say so directly. Honesty over reassurance.
- State assumptions before implementing, not after.
- For anything big (>1 hour, touches scoring, or adds a dependency): propose 2–3 options
  with trade-offs and a recommendation first, then let me pick.
- Explain the why briefly when using a pattern I might not know.
- Verify, don't assert — run the command that proves it and show the output.
- Surface tech debt as you create it.

## Quality gates
- Scoring/data logic → tests mandatory, no exceptions.
- UI → tests optional; working and responsive is the bar.
- External APIs → error handling and secured credentials mandatory.
- User input → validation mandatory.
- No emojis in UI unless I approve them.

## Architecture
See ARCHITECTURE.md. The core rule: one authoritative source per fact, and the frontend
never recalculates scores — it reads them and fails loudly if they're missing. Do not add
fallback calculations; v1 did that and it silently masked automation failures.

## Gotchas
<keep this list short and current; delete entries once fixed>
```

---

## 6. What to do with this repo

Keep it. It's the 2025/26 season's public record and it still serves the live leaderboard.

- Leave the daily workflow enabled or disable it deliberately — the season is over, so it has
  nothing to fetch, but a silently failing cron is noise you don't need.
- When v2 goes live, point the domain at it and leave this deployed as an archive, or export
  the season into v2's database and retire it. The multi-season schema in §3a makes the import
  path straightforward, which is a good reason to get that schema right the first time.
