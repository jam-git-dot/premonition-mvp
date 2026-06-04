# Premonition — Revamp Audit & Plan

> Status: **Foundation slice committed locally (not pushed/deployed).** The live
> leaderboard is untouched until we explicitly `git push`.
>
> Skills used for this audit: `frontend-design` (visual/UX) and
> `vercel-react-best-practices` (performance/structure).

---

## Session log (what's DONE) & Next-session TODOs

### ✅ Done this session (committed to local `main`, NOT pushed)
- Updated stale local clone to `origin/main` (full GW1–38 season).
- Added score-integrity golden-record test (`src/data/scoreIntegrity.test.js`).
- Design foundation: Bricolage Grotesque + Hanken Grotesk fonts, gold/coral brand
  tokens, `font-display` utility, restyled PREMONITION wordmark + input title.
- Repo hygiene: comprehensive `.gitignore` (env/secrets, `public/version.json`,
  `.agents/`, `skills-lock.json`, `coverage/`, `.vercel`); untracked the generated
  `version.json` and the private `.claude` doc. Secret audit: clean (no keys exposed;
  Supabase **anon** key in client bundle is by-design/RLS-protected).

### 🔜 Next session — "major UI fix + optimization"
**Primary (the major UI work):**
- **A3–A6** Leaderboard visual pass: layered dark theme, hero header, replace the
  repetitive stacked `Item` cards with a deliberate layout, refine score color scale
  (accessible/colorblind-safe), add a staggered load-in.
- **A7–A8** Apply the same design language to the (dormant) input phase.

**Optimization:**
- **C1** Stop bundling the 2.2 MB `scoresByGameweek.json` (split per-week / fetch on demand).
- **C2** Code-split the two phases (the inactive phase + `@dnd-kit` shouldn't ship).
- **C4–C5** `useCallback` for memo'd children; extract inline IIFE render blocks.

**Cleanup / health (good to fold in):**
- **C6** Delete dead code: `ModeToggle`, `ProminentButton`, `GroupToggle`,
  `src/data/predictions.js`, empty `SubmitForm.jsx` / `useDragAndDrop.js`, root
  duplicate `*.cjs`, unused `prominent` styles.
- Address the **66 pre-existing ESLint errors** (e.g. `no-undef __dirname` in
  `vite.config.js`, unused `availableMatchweeks` import) — none introduced this session.
- Fix the build warning: inconsistent JSON import attributes for
  `standingsByGameweek.json` (`competitionData.js` uses `with { type: 'json' }`, the
  hook does not).

**Functionality (later phases):**
- **B1** Read predictions live from Supabase (must reproduce identical historical
  scores — gate against the golden record).
- **B2–B7** edit-existing-prediction, real groups + submission lock, dedupe the
  double `/version.json` fetch, reconcile the hidden FPL group, direct gameweek
  navigation, first-class consensus modeling.

**Deploy gate:** push `main` to production only once the leaderboard restyle (A3–A6)
is finished, so the live site updates in one finished step rather than transitionally.

---

## 0. How the app actually works (the parts that matter for safety)

### The two phases and how rendering branches
- The phase is chosen by a **build-time environment variable**, not a runtime
  toggle: `App.jsx:16` → `const appMode = import.meta.env.VITE_APP_MODE || 'dashboard'`.
- `App.jsx:133` branches: `if (appMode === 'dashboard')` renders
  `<CompetitionDashboard/>` (**LEADERBOARD phase, currently live**). Otherwise it
  falls through to the inline **PREDICTION INPUT phase** JSX (email/name + drag-drop
  `<TeamList/>` + Supabase submit).
- `.env.local` sets `VITE_APP_MODE=dashboard`. The default when unset is also
  `dashboard`. **So the production Vercel build must have `VITE_APP_MODE` either
  unset or `=dashboard` to keep the leaderboard live.**
- `ModeToggle.jsx` exists but is **dead code** — it is imported nowhere. There is no
  in-app button that can flip phases. Switching phases = changing the Vercel env var
  and redeploying. **This is the "manual toggle" the owner controls.**

> ⚠️ **Safety rule for the whole revamp:** never set `VITE_APP_MODE=prediction` in
> the production Vercel environment, and never change the `App.jsx:16`/`:133`
> branching default. Any work on the input phase must be exercised locally with a
> local env override only.

### Deployment & the daily auto-commit (important for branch strategy)
- Repo: `github.com:jam-git-dot/premonition-mvp`, deployed by Vercel on push to
  `main`. No `vercel.json` (Vite defaults).
- `.github/workflows/update-standings.yml` runs daily (cron `0 3 * * *`), fetches
  results, and **auto-commits `standingsByGameweek.json` / `scoresByGameweek.json` /
  `teamSnapshots.json` directly to `main`**, which triggers a Vercel redeploy.
- Implication: `main` receives automated commits we don't author. A long-lived
  revamp branch will need to periodically merge `main` in (data files only — low
  conflict risk with UI code, but real if we move/rename data files).

### Data flow (single source of truth)
- **Standings**: `src/data/standingsByGameweek.json` (`{ "1": {"1":"Arsenal",...}, ... }`).
- **Scores**: `src/data/scoresByGameweek.json` — **pre-computed by the automation**,
  read directly by the frontend. The frontend never calculates scores live
  (`useCompetitionData.js:33`). **2.2 MB file.**
- **Predictions (leaderboard side)**: hardcoded `realPredictions` array in
  `src/data/competitionData.js` (24 players).
- **Predictions (input side)**: the input phase writes to a **Supabase** `predictions`
  table (`App.jsx:61-85`). 
- 🔴 **These two are not connected.** Supabase submissions do not feed the leaderboard;
  someone hand-transcribes them into `competitionData.js`. This is the single biggest
  functional gap (see B1).

### Current live data state (the thing we must preserve)
- 29 consecutive gameweeks of standings **and** scores (GW1–GW29), 24 players.
- `public/version.json`: last build `2026-03-12`, hash `684e216`.
- ✅ **CORRECTION (2026-06):** an earlier draft said the data was "frozen at GW29."
  That was wrong — it was only my **stale local clone** (77 commits behind `origin/main`).
  The remote/deployed site has the **complete season, GW1–GW38**, and the daily
  automation ran fine through `2026-05-28`. Local `main` and the `revamp` branch have
  since been updated to `origin/main`. **No backfill is needed — Phase 0 below is
  effectively resolved.** Lesson: `git fetch` and compare to `origin/main` before
  reasoning about data state.

### Shared vs phase-specific code
| Area | Leaderboard only | Input only | Shared |
|---|---|---|---|
| Entry/branch | `CompetitionDashboard.jsx` | inline JSX in `App.jsx` | `App.jsx`, `main.jsx`, `ErrorBoundary` |
| Components | `Leaderboard`, `ResultsTable`, `LiveTableSection`, `LeaderboardDotPlot`, `WeekComparisonModal`, `CellPopup` | `TeamList`, `TeamItem` | `ui/*` (button, card, dialog, badge, item, dropdown-menu), `theme.js`, `lib/utils` |
| Data | `scoresByGameweek.json`, `standingsByGameweek.json`, `groupDataProcessor.js`, `useCompetitionData` | Supabase, `teams.js`, `validation.js` | `competitionData.js` (`realPredictions`), `teamInfo.js` |
| Deps | — | `@dnd-kit/*` | `@supabase/supabase-js`, `@vercel/analytics` |

### Dead / unused code found (safe-delete candidates, verify first)
`ModeToggle.jsx`, `ProminentButton.jsx`, `GroupToggle.jsx`, `src/data/predictions.js`
(152 lines, imported nowhere), `SubmitForm.jsx` (0 bytes), `useDragAndDrop.js`
(0 bytes), the unused `prominentButton`/`prominent` styles in `theme.js`/`button.jsx`,
and root-level duplicate scripts `compare-weeks.cjs` / `regenerate-scores.cjs` /
`update-standings.cjs` (the maintained copies live in `scripts/`).

---

## Phase 0 — Data integrity — ✅ RESOLVED (was based on a stale clone)

Originally scoped as "backfill GW30–38." **Not needed.** The remote already had the
full GW1–38 season; the gap was only my stale local checkout (see correction in §0).

What was actually done:
- `git fetch` + fast-forward local `main` and `revamp` to `origin/main` (full season).
- Regenerated the score-integrity golden record (`scoreIntegrity.test.js` snapshot)
  against the real **GW1–38** data; the independent recalculation check passes, so the
  shipped final scores are self-consistent. **This is now the baseline.**

Remaining (low priority): `missed-gameweeks.json` still lists a GW14 skip from December
— confirm it was reconciled (data now contains GW14, so likely stale bookkeeping).

---

## (A) Visual / Design changes
*(Lens: `frontend-design`. The skill's core warning: avoid generic "AI slop" — Inter/
system fonts, purple-on-white gradients, evenly-grey palettes, predictable stacked
layouts. This app currently hits several of those.)*

**Committed aesthetic direction (owner decision on O2): "Playful / friends-league."**
Lean into the existing humor (WINNERS / WANKERS / 💩) and make it bold, fun, and
characterful rather than corporate — while staying legible for dense score tables.
Concretely that means: an expressive **display font** for headers/standings with a
clean tabular-number body font (A1); a confident, saturated palette with a couple of
sharp accents instead of all-grey (A2/A3/A5); personality in the empty/winner/loser
states and micro-interactions (A6/A8). Both phases share this language (A7).

| # | Phase | What's wrong now | Proposed change | Files | Effort | Risk |
|---|---|---|---|---|---|---|
| A1 | Both | **Font is Inter** — the exact generic family the design skill flags. Set in `tailwind.config.js:11` and `index.css:1,60`. | Adopt a distinctive display+body pairing (e.g. a characterful condensed/grotesk display for "PREMONITION"/headers + a clean numeric-friendly body). Tabular-figure font for score tables. | `tailwind.config.js`, `index.css`, `theme.js` | M | Low |
| A2 | Both | **Purple→blue gradient** clichés on CTAs (`theme.js:54` `prominentButton`, `button.jsx:24-25` `prominent`). | Replace with a committed brand palette + accent; drop the purple gradient. (Note these specific styles are currently unused — fold into the design-system rework.) | `theme.js`, `button.jsx` | S | Low |
| A3 | Leaderboard | Flat `bg-gray-800` everywhere, weak hierarchy, gray-on-gray. No atmosphere/depth. | Establish a real dark theme with layered surfaces, depth, a hero treatment for the title block, and a clear type scale. | `CompetitionDashboard.jsx`, `theme.js`, `index.css` | L | Med |
| A4 | Leaderboard | The page is a long vertical stack of near-identical `Item` cards ("Filter", "View My Predictions", "Group Performance", "View Other Gameweeks") — repetitive, low signal. | Reorganize into a deliberate layout: compact control bar / tabs, leaderboard as the hero. Reduce vertical monotony. | `CompetitionDashboard.jsx` | L | Med |
| A5 | Leaderboard | Score color-coding (`theme.js:78` `getCellStyle`) is a harsh green→yellow→orange→red wash; cells are visually noisy in `ResultsTable`. | Refine into a cohesive, accessible scale (fewer steps, consistent contrast, colorblind-safe). | `theme.js`, `ResultsTable.jsx`, `LiveTableSection.jsx` | M | Med |
| A6 | Leaderboard | No motion. The skill recommends one well-orchestrated load reveal. | Add a staggered load-in for the leaderboard + subtle micro-interactions on rows/dots. | `CompetitionDashboard.jsx`, `Leaderboard.jsx`, `LeaderboardDotPlot.jsx` | M | Low |
| A7 | Input | **Generic "green-50 → blue-50" gradient + centered white card** (`App.jsx:150`) — textbook generic look. | Rebuild the input screen with the same new design language as the leaderboard so the two phases feel like one product. | `App.jsx` (input JSX), `TeamList.jsx`, `TeamItem.jsx` | M | Low (dormant) |
| A8 | Input | `TeamItem` uses emoji badges (🏆🥉🏅⬇️) and flat colored strips; success modal uses 🎉/❌ at `text-6xl`. Functional but generic. | Cohesive position-zone styling + real team color treatment (data already in `teamInfo.js`); restyle modals. | `TeamItem.jsx`, `App.jsx` | M | Low (dormant) |
| A9 | Both | Inconsistent design tokens: colors/spacing are split between `theme.js`, Tailwind config CSS vars, and inline hex (`theme.js:64` `getRowTint`). | Consolidate into one token source so both phases share it. (Pairs with C3.) | `theme.js`, `index.css`, `tailwind.config.js` | M | Med |

---

## (B) Functionality changes

| # | Phase | What's wrong now | Proposed change | Files | Effort | Risk |
|---|---|---|---|---|---|---|
| B1 | Both | 🔴 **Input submissions (Supabase) and the leaderboard (hardcoded `realPredictions`) are disconnected.** New predictions must be hand-copied into `competitionData.js`. | **Decision (O3): read predictions live from Supabase.** Leaderboard + scoring scripts pull predictions from Supabase instead of the hardcoded array. **Critical constraint:** the *current/frozen* season's 24 predictions must produce byte-identical scores after the switch — migrate them into Supabase and verify against the golden record before removing the array. Plan for: schema (rankings/groups), a deadline-lock so a started season can't be edited, and a fallback if Supabase is unreachable at load. | `competitionData.js`, `useCompetitionData.js`, scoring scripts, Supabase, `App.jsx` | L | **High** (drives all scoring — gate every change against the golden record) |
| B2 | Input | No "load my existing prediction to edit" — submit blindly upserts by email (`App.jsx:61`). No read-back, no confirmation of current ranking. | Add fetch-by-email to pre-fill the drag list before editing. | `App.jsx`, `TeamList.jsx` | M | Low (dormant) |
| B3 | Input | Validation is client-only (`utils/validation.js`); `group: 'dev'` is hardcoded (`App.jsx:48`). No deadline/lock enforcement. | Real group selection, and a submission lock tied to season start (so input can't overwrite a started season). | `App.jsx`, `validation.js` | M | Med |
| B4 | Leaderboard | `/version.json` is fetched **twice** (`App.jsx:33` and `CompetitionDashboard.jsx:36`) for different purposes (version vs last-updated). | Fetch once, share; or bake values at build (`scripts/version.js` already runs). | `App.jsx`, `CompetitionDashboard.jsx` | S | Low |
| B5 | Leaderboard | "FPL" group is silently filtered out in the UI (`CompetitionDashboard.jsx:69`) but still present in data/counts. | Decide: remove FPL group properly or surface it. Reconcile `availableGroups` counts. | `CompetitionDashboard.jsx`, `competitionData.js` | S | Low |
| B6 | Leaderboard | Gameweek navigation is prev/next arrows only (`CompetitionDashboard.jsx:273`). Hard to jump across 29 weeks. | Add direct week selection (dropdown/slider) and deep-linkable state (URL param). | `CompetitionDashboard.jsx` | M | Low |
| B7 | Leaderboard | Consensus row is appended to results in the hook and filtered back out in several places (`useCompetitionData.js:75`, `CompetitionDashboard.jsx:66`, dot plot filters). Fragile. | Model consensus as a first-class, clearly-separated entity rather than smuggling it into `enhancedResults`. | `useCompetitionData.js`, `Leaderboard.jsx`, `ResultsTable.jsx`, `LeaderboardDotPlot.jsx` | M | Med |

---

## (C) Performance / Structure changes
*(Lens: `vercel-react-best-practices`.)*

| # | Phase | What's wrong now | Proposed change | Files | Effort | Risk |
|---|---|---|---|---|---|---|
| C1 | Leaderboard | 🔴 **`scoresByGameweek.json` is 2.2 MB and is statically imported into the JS bundle** (`useCompetitionData.js:12`). Shipped bundle is **1.65 MB JS**. Every visitor downloads all GWs of scores up-front. Rule: `bundle-conditional` / `bundle-analyzable-paths`. | **Greenlit (O5):** split scores per-gameweek and fetch on demand (lazy-load non-current weeks). **Must:** score-integrity gate proves every number is unchanged, AND the daily auto-update Action still writes correctly after the file layout changes (update `scripts/update-standings.js` + the workflow's `git add` paths). Starts only after Phase 0. | `useCompetitionData.js`, `competitionData.js`, `scripts/update-standings.js`, `.github/workflows/update-standings.yml`, build | M | Med (data path + CI — verify numbers + Action) |
| C2 | Both | **No code-splitting between phases.** Because `appMode` is a build-time constant, the inactive phase (incl. heavy `@dnd-kit/*` for input) is still bundled. Rule: `bundle-dynamic-imports`. | `next/dynamic`-equivalent: `React.lazy` + dynamic import so each build only ships its phase's code. | `App.jsx` | S–M | Low |
| C3 | Both | Design tokens duplicated/inline (see A9); `theme.js` mixes Tailwind classes and raw hex. | Single token module; removes drift and shrinks repeated class strings. | `theme.js`, `index.css` | M | Med |
| C4 | Leaderboard | Handlers (`handleNameClick`, `handleCellClick`) are recreated every render and passed to `React.memo`'d children (`ResultsTable`, `Leaderboard`), partially defeating memoization. Rules: `rerender-functional-setstate`, `rerender-memo`. | Wrap in `useCallback`; keep `setSelectedMatchweek` functional updates. | `CompetitionDashboard.jsx` | S | Low |
| C5 | Leaderboard | Inline IIFEs render table bodies inside JSX (`CompetitionDashboard.jsx:363`, `LiveTableSection.jsx:33`), re-running each render and hurting readability. Rule: `rerender-no-inline-components`. | Extract to small memoized components / helper renderers. | `CompetitionDashboard.jsx`, `LiveTableSection.jsx` | M | Low |
| C6 | Both | **Dead code** (see list in §0): `ModeToggle`, `ProminentButton`, `GroupToggle`, `predictions.js`, empty `SubmitForm`/`useDragAndDrop`, root duplicate `.cjs` scripts, unused `prominent` styles. | Delete after confirming no references. Reduces confusion and bundle. | listed files | S | Low |
| C7 | Both | `competitionData.js` is 250 lines dominated by `realPredictions` with a **commented-out duplicate of every ranking line** (the author's own `JAM NOTES` flag this). Noise + risk of editing the wrong copy. | Clean up (remove dup comments); consider moving prediction data to JSON. Do **not** change any actual ranking values. | `competitionData.js` | S | Med (it feeds scoring) |
| C8 | Leaderboard | No component tests; only `competitionData.test.js`. A big refactor needs a safety net. | Add render/smoke tests + a score-snapshot test before refactoring (see Verification). | `src/**/*.test.*` | M | Low |

---

## Verification & Safety Strategy (BEFORE we touch code)

### Establish a baseline first (do this before any change)
1. **Capture the live numbers.** Snapshot the current leaderboard for several
   gameweeks (at least GW1, a mid week, and GW29) and all 24 players' totals — e.g.
   `npm run health-check` plus a saved JSON dump of `scoresByGameweek.json` totals.
   This becomes the golden record. *If any later step changes a single score, we
   catch it.*
2. **Build the current `main` once** (`npm run build`) and record bundle size +
   that the dashboard renders, so we can compare before/after.
3. Confirm Vercel production env: `VITE_APP_MODE` unset or `dashboard`. Document it.

### Score-integrity gate (the non-negotiable one)
- Add a **snapshot test** that asserts the exact `totalScore` for every player in
  every gameweek matches the golden record (C8). This test must pass after **every**
  change. Any visual/structure refactor that alters a number fails the gate.
- Keep `standingsByGameweek.json`, `scoresByGameweek.json`, and `realPredictions`
  values **byte-for-byte unchanged** during the UI/structure work. C1/C7 touch how
  this data is *loaded/stored*, not its values — those PRs specifically diff the
  computed output against the golden record.

### Per-phase verification checklist (run after each work chunk)
- **Leaderboard (live)** — for each change: dashboard renders; leaderboard
  Winners/Wankers correct; group filter (All/LIV/TOG) changes counts correctly;
  gameweek nav GW1↔GW29; "View My Predictions" modal totals match golden record;
  Full Table renders all 24 + consensus; dot plot + week-comparison modal open.
- **Input phase (dormant) without activating it** — exercise it **locally only**:
  run `VITE_APP_MODE=prediction npm run dev` on your machine, verify drag-drop,
  validation, and a **Supabase submit into a throwaway/test group** (never the real
  data). Production env var stays `dashboard` the whole time. Optionally point local
  at a separate Supabase project/table so test submits can't pollute real predictions.
- **Cross-check the live URL** after any deploy: load the production site, confirm
  GW29 leaderboard and a spot-check player total against the golden record.

### Verification cadence
- After **each** numbered item: run `npm run test:run` (incl. the new score-snapshot
  test) + `npm run lint` + `npm run build`, and eyeball the affected phase.
- Before merge to `main`: full checklist above + production smoke test.

---

## Branch / Deployment recommendation

**Recommended: a long-lived `revamp` branch + a Vercel Preview Deployment, keep
`main` as the untouched live leaderboard.**

- Vercel auto-creates a **preview URL for every branch/PR** — so the revamp is fully
  visible and clickable at a separate URL while production (`main`) keeps serving the
  real leaderboard with the real data. Zero risk to the live site during the build.
- Set the **preview** environment's `VITE_APP_MODE` per what you want to demo (you
  can even run two previews — one dashboard, one prediction — to review both phases),
  while **production stays `dashboard`**.
- Because the daily Action commits data to `main`, periodically `git merge main` into
  `revamp` to stay current; conflicts should be limited to the data JSON (and only if
  C1/C7 relocate those files — sequence those carefully).
- Cut work into small PRs onto `revamp` (design system → leaderboard visual →
  perf/structure → input phase → functionality), each passing the score-integrity
  gate, so review is reviewable and reversible.

**Tradeoffs vs alternatives**
- *Work directly on `main`*: simplest, but every push risks the live leaderboard and
  tangles with the auto-commits. ❌ Not worth it for a "major revamp."
- *Separate new Vercel project*: maximum isolation, but duplicates env vars/Supabase
  config and the daily Action only feeds the original repo — data would go stale on
  the copy. Overkill here. The preview-deploy approach gives the same isolation
  without the duplication.
- *Feature-flag both old and new UI in one build*: lets you ship incrementally behind
  a flag, but doubles the code paths and bundle during the transition. Reasonable only
  if you want a gradual public rollout; otherwise the branch+preview is cleaner.

---

## Decisions captured (from review)
- **O1 — Final results:** investigate the GW29 freeze and backfill to true final →
  now **Phase 0** (prerequisite).
- **O2 — Aesthetic:** **Playful / friends-league** — folded into section (A) intro.
- **O3 — Predictions source:** **read live from Supabase** next season → **B1** updated.
- **O5 — Data restructure:** **greenlit** if numbers verified + Action still works →
  **C1** updated.

## Still open (need your input to finalize sequencing)
- **O4 — Scope of "functionality":** any specific new features you already want
  (e.g. per-team movement charts, head-to-head, shareable result cards, badges), or
  is B1–B7 the working set?
- **O6 — Phase 0 ownership:** do you want me to do the diagnosis + GW30–38 backfill
  (P0) as the first concrete task, or will you handle the data and have me focus on
  design/structure? (Backfill writes canonical data, so it's the highest-care step.)
- **O7 — Build order:** proposed sequence is P0 → design system (A1/A2/A9/C3) →
  leaderboard visual (A3–A6) → perf/structure (C1/C2/C4–C8) → input phase (A7/A8) →
  functionality (B1–B7). Happy with that order, or reprioritize?
