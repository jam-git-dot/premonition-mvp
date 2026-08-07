# Premonition v2 — scope & decision log

Living document. Source material: `Premonition v2 Notes.md` (personal notes, outside the repo)
and the scoping conversation of 2026-08-07. Companion to `docs/V2_FOUNDATION.md`, which covers
the technical carry-over from the MVP.

**This doc is the queue.** Open questions get worked one at a time; answers land in the decision
log so we never re-litigate them.

---

## The constraint that shapes everything

The 2026/27 Premier League season opens **Friday 21 August 2026** (Arsenal v Coventry).
As of 2026-08-07 that is **14 days**. Predictions must close before first kickoff, and ~100
people need time to actually submit, so **prediction entry has to be live in roughly 7 days**.

The full v2 vision is a two-to-three-month project. It does not fit. But only one piece of it
is deadline-bound, because **predictions are immutable once collected** — the schema they land
in is the one thing that can't be fixed later. Everything else can be rebuilt at leisure.

---

## Phase 1 — prediction entry (hard deadline, ~7 days)

**In scope**
- Data model for seasons, players, predictions, groups, and match results.
- Prediction entry: drag-and-drop ranking of 20 teams, email capture, multi-group selection.
- Integrity: append-only storage, automatic backup, and a verification step confirming each
  prediction still matches the player it was submitted by.
- Enough visual quality that it reads as a considered product, not a raw HTML form —
  achieved by using shadcn/ui properly rather than by custom design work.

**Explicitly not in scope** (Phase 2, no exceptions — this is what protects the deadline)
- The leaderboard.
- The UI overhaul.
- Component-isolation refactors beyond writing new components correctly the first time.
- Bonus prediction questions (favourite team, most yellow cards, etc.).
- Storybook.
- Anything league-agnostic beyond keeping league data in a table rather than hardcoded.

**Why the leaderboard can wait:** nobody cares about standings for the first few weeks of a
season. Emails are captured at entry precisely so players can be pulled back when it launches.

---

## Phase 2 — the real v2 (Sept–Nov, no deadline)

- Leaderboard rebuild — the actual heart of the v2 overhaul.
- Full UI/UX overhaul with a design system: global style tokens so a table looks identical
  whether it is on the main page or inside a modal.
- Strict component isolation (see "Rejected" below for what this replaces).
- Storybook as the sandbox for trialling elements before they reach the live site.
- Bonus prediction questions.
- Per-player pages and shareable links.
- League-agnostic data layer, proven by remaining correct for Premier League only.
- **Idea, low priority:** a personal football-stats playground — fantasy leaderboards, team
  stats, play-style visualisation.

---

## Decisions locked

| # | Decision | Rationale |
|---|---|---|
| 1 | **New repo for v2**, MVP kept as archive | Bandaged code copied forward never gets deleted |
| 2 | **Phase 1 / Phase 2 split** as above | Only entry is deadline-bound |
| 3 | **Option A** — ship fresh v2 entry in ~7 days | The MVP's entry code is the code that produced the integrity failures |
| 4 | **Strict component isolation**, not a layout engine | Same outcome, ~5% of the cost |
| 5 | **Storybook** as the sandbox workflow | Exactly the tool the notes described inventing |
| 6 | **Keep shadcn/ui** | Already in use in the MVP and a good fit |
| 7 | **Tech stack is not outdated** — no stack-shopping | React + Vite + Tailwind + Supabase is current; the MVP's failures were architecture and data integrity, not tooling |
| 8 | **Match results as the atomic append-only log** | Standings and scores become derived values, so nothing can silently rewrite history |
| 9 | **Engagement features out of scope** | No weekly predictions; v2 keeps the season-long format |
| 10 | **Next.js** | Server rendering gives shareable player pages and server-side data fetching (the fix for the 2.8 MB bundle); predictions get written server-side where they can't be tampered with. Migrating to it later would be a real rewrite |
| 11 | **TypeScript** | Eliminates the MVP's worst bug class — a renamed or mistyped field silently becoming `undefined` inside a score calculation |

---

## Hard requirements (from the notes)

**Data integrity — the single biggest reason v2 exists.** The MVP hallucinated or altered
players' predictions, miscalculated scores, and left unnoticed gaps in the standings log,
requiring manual repair from a personal offline backup.

- Predictions must never change after submission.
- Predictions must be backed up automatically.
- Player identity must be verifiable against their stored prediction on an ongoing basis.
- One append-only source of truth. No parallel logs that can drift out of sync.

**No manual standings entry, ever.** Store points per team per games-played so standings can be
indexed off a games-played integer. This dissolves the unequal-games-played problem that had to
be patched in the MVP frontend.

**Cohesive product.** Prediction entry and leaderboard are one unified site sharing a design
language, not two separate apps as they became in the MVP. The entry stage isn't discarded when
predictions close.

**Scale:** ~100 players, optimistically a few hundred. Publicly joinable.

**Budget:** paid hosting/storage acceptable where it buys autonomy or reliability.

**Ambition:** not a commercial product yet, but built so it could become one.

---

## Rejected, with reasons — do not revisit without new information

- **Runtime-configurable layout / mini-CMS.** The goal (moving an element shouldn't break
  the page) is valid; the mechanism isn't. A layout engine is a large project that locks in an
  abstraction before the requirements are known. Component isolation delivers the same result:
  a component renders itself and knows nothing about where it lives, the parent owns layout, so
  moving a section is genuinely a one-line change.
- **Copying the MVP working directory to seed v2.** Guarantees the bandaged code survives.
- **Changing the tech stack.** Would burn the 14 days on a non-problem.
- **Engagement optimisation / weekly predictions.** Deliberately out of scope for v2.

---

## Open questions

Worked one at a time. Answered ones move to the decision log above.

| # | Question | Status |
|---|---|---|
| 1 | Framework and language for the v2 scaffold | **Answered** → decisions 10 & 11 |
| 2 | Schema design | **Drafted** in `docs/V2_SCHEMA.md`, awaiting review |
| 5 | Are groups per-player or per-season? | Proposed in schema (per-player) — confirm |
| 6 | Does player identity persist across seasons? | Proposed in schema (yes, keyed on email) — confirm |
| 7 | Auth: email-only, magic links, or accounts? | Proposed in schema (email-only) — confirm, and decide whether editing before lock is a Phase 1 requirement |
| 3 | Supabase: revive the dormant project, start fresh, or an alternative? Paid tier? | Open — blocks applying the schema |
| 4 | What is port-worthy from the MVP's entry path? | Open — needs narrow review |
| 8 | Where does the domain point during the transition? | Open — not urgent |

**Note on the code review:** the notes ask for a comprehensive review of the MVP codebase. With
7 days on the clock, that should be narrowed to the prediction-entry path only (question 4).
A full review of the leaderboard code belongs in Phase 2, where there is no deadline — and much
of it will be moot if that code is being replaced.
