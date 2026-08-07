# Phase 1 — prediction entry: ordered task list

**Deadline: entry live by ~14 Aug 2026.** The season opens Fri 21 Aug; ~100 people need about
a week to actually submit. Everything here is tracked with checkboxes — tick them as they land,
and the "Status" line below gets updated as we go.

**Status: not started.** 0 / 34 complete. Last updated 2026-08-07.

Scope, decisions, and schema live in `V2_SCOPE.md` and `V2_SCHEMA.md`. This file is only
*what to do, in what order*.

---

## Sequencing logic

Three things drive the order:

1. **Nothing can be built until there's a database and a repo**, so setup is first even though
   it's the least interesting part.
2. **Entry ships before editing.** Editing is only needed before the deadline, not before entry
   opens — so people can start submitting while the edit flow is still being built. This is the
   main piece of slack in the plan; if anything slips, it should be this.
3. **Backups exist before real predictions do.** Once someone's genuine prediction is in the
   database, losing it is unacceptable. The backup job is not a polish item.

**⚠️ Honest risk note:** this is aggressive for someone learning Next.js and TypeScript at the
same time. Stage 0 and Stage 1 are the ones that must not be rushed — a wrong schema is
permanent, whereas a plain-looking form is not.

---

## Stage 0 — Setup (blocking, do first)

- [ ] Decide Supabase: revive the dormant project, or start fresh. **Recommend fresh** — clean
      schema, no legacy tables, and the old data is preserved in the MVP repo regardless
- [ ] Choose a Supabase tier that does not pause on inactivity (free tier pausing is what broke
      the MVP's database)
- [ ] Create the `premonition` GitHub repo (new, not a copy of `premonition-mvp`)
- [ ] Scaffold Next.js + TypeScript + Tailwind
- [ ] Install and configure shadcn/ui
- [ ] Write v2 `CLAUDE.md` (template is in `V2_FOUNDATION.md` §5) and port `V2_SCOPE.md`,
      `V2_SCHEMA.md`, and this file into the new repo
- [ ] `.env.example`, `.gitignore`, and `.claude/settings.json` — track shared config, ignore local
- [ ] CI: lint + tests run on every PR, merges blocked on failure
- [ ] Deploy the empty scaffold to Vercel and confirm the pipeline works end to end

## Stage 1 — Data layer (the irreversible part)

- [ ] Write migrations for every table in `V2_SCHEMA.md`, checked into the repo
- [ ] Seed leagues and teams for the Premier League
- [ ] **Verify the 2026/27 team list** — promotion and relegation mean it differs from 2025/26.
      Coventry are up; confirm all 20 against a real source before anyone predicts against them
- [ ] Seed the 2026/27 season with `starts_at` and `predictions_close_at` set from real fixtures
- [ ] Checksum function for prediction versions
- [ ] Append-only triggers: block `UPDATE`/`DELETE` on versions and rankings; block any write
      once `locked_at` is set
- [ ] RLS policies, written and tested before real data lands
- [ ] Test that the triggers actually refuse a tampering attempt — a rule nobody has tried to
      break is only a hope

## Stage 2 — Prediction entry (the deadline-critical path)

- [ ] Email + display name capture
- [ ] Drag-and-drop ranking of the 20 teams (port the dnd-kit approach from the MVP — it worked)
- [ ] Multi-group selection, fixing the MVP limitation that needed hand-editing for two groups
- [ ] Server-side submit action: validate, checksum, write version 1
- [ ] Reject submissions after `predictions_close_at`, server-side — not just a hidden button
- [ ] Confirmation screen showing exactly what was saved, so people can see their own prediction
- [ ] Mobile layout — assume most people submit on a phone
- [ ] End-to-end smoke test with a real submission against the real database

## Stage 3 — Integrity (before real data accumulates)

- [ ] Nightly backup export of all predictions to versioned storage
- [ ] Restore drill: prove a backup can actually be restored. An untested backup is not a backup
- [ ] Scheduled checksum verification job, alerting on any mismatch
- [ ] Golden-record test scaffolding, ported from the MVP's `scoreIntegrity.test.js`

## Stage 4 — Edit flow (can land after entry opens)

- [ ] Magic-link auth via Supabase `signInWithOtp`
- [ ] "Edit my prediction" entry point
- [ ] Versioned save — new version each time, never an overwrite
- [ ] Show the player their own edit history
- [ ] Lock job: stamp `locked_at` at `predictions_close_at`

## Stage 5 — Ship

- [ ] Deploy to production
- [ ] Submit a real prediction end to end, then verify the row and the backup
- [ ] Decide where the domain points during the transition (question 8 in `V2_SCOPE.md`)
- [ ] Send the link out

---

## Explicitly not in Phase 1

Listed so they can be pointed at rather than argued about: the leaderboard, the UI overhaul,
Storybook, component-isolation refactors, bonus prediction questions, per-player pages, the
stats playground, and anything league-agnostic beyond keeping league data in a table.

All of it is Phase 2, which has no deadline.
