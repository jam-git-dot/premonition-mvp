# Premonition v2 — schema proposal (draft, for review)

Companion to `docs/V2_SCOPE.md`. **Not yet agreed** — three embedded decisions are flagged at
the bottom and need a call before this is applied.

This is the piece of Phase 1 that genuinely cannot be fixed later, because predictions are
immutable once collected. Everything else in v2 is rebuildable; this isn't.

---

## The organising idea

**`matches` is the only thing the ingest job writes, and it only ever appends.** Standings,
points-at-N-games, and player scores are *derived* from it — never stored as independent facts
that can drift.

This is the direct fix for the MVP's failure mode. There, standings and scores were separate
logs that could disagree, gaps went unnoticed, and repairs meant hand-editing a file. Here,
a wrong number can only mean a wrong match result, which is one row, visible, and correctable
by fixing that row — after which everything downstream recomputes.

It also dissolves the unequal-games-played problem. "Standings after each team has played N
games" stops being a special case and becomes an ordinary query.

---

## Tables

### Reference data — league-agnostic from day one

```sql
leagues (
  id            uuid primary key,
  name          text not null,          -- 'Premier League'
  slug          text not null unique,   -- 'premier-league'
  country       text,
  team_count    int not null            -- 20; varies by league
)

teams (
  id            uuid primary key,
  league_id     uuid not null references leagues(id),
  name          text not null,          -- 'Arsenal'
  abbreviation  text not null,          -- 'ARS'
  external_id   text,                   -- football-data.org id, for ingest
  unique (league_id, name)
)

seasons (
  id                    uuid primary key,
  league_id             uuid not null references leagues(id),
  name                  text not null,          -- '2026/27'
  starts_at             timestamptz not null,   -- first kickoff: 2026-08-21
  predictions_close_at  timestamptz not null,
  status                text not null           -- upcoming | open | active | complete
)

-- Which teams are in which season. Promotion and relegation make this essential:
-- Coventry are in 2026/27 and were not in 2025/26.
season_teams (
  season_id  uuid not null references seasons(id),
  team_id    uuid not null references teams(id),
  primary key (season_id, team_id)
)
```

### People

```sql
players (
  id            uuid primary key,
  email         text not null unique,   -- captured at entry
  display_name  text not null,
  created_at    timestamptz not null default now()
)

groups (
  id    uuid primary key,
  name  text not null,      -- 'LIV'
  slug  text not null unique
)

-- Join table: a player can be in several groups. Fixes the MVP limitation
-- that required hand-editing the backend to put someone in two groups.
player_groups (
  player_id  uuid not null references players(id),
  group_id   uuid not null references groups(id),
  primary key (player_id, group_id)
)
```

### Predictions — the sacred part

```sql
predictions (
  id            uuid primary key,
  season_id     uuid not null references seasons(id),
  player_id     uuid not null references players(id),
  submitted_at  timestamptz not null default now(),
  locked_at     timestamptz,
  checksum      text not null,          -- hash of the ordered team list
  unique (season_id, player_id)         -- one prediction per player per season
)

-- One row per ranked position, rather than a single JSON blob.
prediction_rankings (
  prediction_id  uuid not null references predictions(id),
  position       int  not null check (position >= 1),
  team_id        uuid not null references teams(id),
  primary key (prediction_id, position),
  unique (prediction_id, team_id)       -- a team cannot appear twice
)
```

**Why rows instead of a JSON blob** (the MVP stored `rankings jsonb`):

- The database enforces the rules — no duplicate teams, no duplicate positions, every team real.
  A blob can hold nonsense and nothing notices.
- Corruption is bounded. A bad write damages one row, not an entire prediction.
- "Who predicted Arsenal first?" becomes a query rather than a full scan and parse.

### Match results — the append-only source of truth

```sql
matches (
  id             uuid primary key,
  season_id      uuid not null references seasons(id),
  matchday       int  not null,          -- scheduled gameweek
  home_team_id   uuid not null references teams(id),
  away_team_id   uuid not null references teams(id),
  home_goals     int,                    -- null until played
  away_goals     int,
  kicked_off_at  timestamptz,
  status         text not null,          -- scheduled | finished
  external_id    text unique,            -- dedupe guard on re-ingest
  ingested_at    timestamptz not null default now()
)
```

A match moves `scheduled → finished` exactly once. The ingest job is idempotent: re-running it
is always safe, because `external_id` prevents duplicates.

### Derived — computed, never hand-written

- **`team_points_after_n_games(season, team, n)`** — points from that team's first *n* finished
  matches. This is the "index standings off a games-played integer" idea from the notes.
- **`standings_at_n_games(season, n)`** — teams ordered by points, then goal difference, then
  goals scored.
- **`player_score_at_n_games(season, player, n)`** — `sum(|predicted position − actual position|)`
  across all teams. Lower is better, unchanged from the MVP.

Start these as SQL views. If the leaderboard gets slow in Phase 2, materialise them then —
but only as a cache that can always be rebuilt from `matches`, never as a second source of truth.

---

## Integrity mechanisms

These exist because the MVP altered predictions, miscalculated scores, and left gaps unnoticed.

1. **Checksum on write.** Hash the ordered team list at submission. Verified on every read; a
   mismatch is a loud error, not a silent correction.
2. **Append-only enforcement.** A database trigger blocks `UPDATE` and `DELETE` on `predictions`
   and `prediction_rankings` once `locked_at` is set. Not a convention — the database refuses.
3. **Scheduled verification.** A daily job re-checks every prediction's checksum against its
   rows and alerts on any mismatch. This is the automated version of the offline backup you had
   to reconcile by hand.
4. **Automatic backups.** Nightly export of predictions to versioned storage, independent of
   the database's own backups.
5. **Golden-record test.** Ported from the MVP: snapshot real computed scores so any change to
   scoring logic that would alter a historical result fails the build.
6. **Server-side writes only.** Predictions are written through the server, never from the
   browser, so validation cannot be bypassed by a user.

---

## Three decisions embedded here — please confirm or correct

**1. Player identity persists across seasons.** `players` is keyed on email and separate from
`predictions`, so the same person carries forward and career stats become possible later
("you've beaten Dave two years running"). Nearly free now, painful to retrofit. The cost is that
email becomes the identity key, so a player changing email needs a merge.

**2. Groups belong to the player, not the prediction.** This makes joining a group after
submitting trivial, since membership is independent of the prediction. The trade-off: group
membership isn't versioned per season, so if your friend groups change year to year, history
shows current membership rather than membership at the time. The alternative — putting
`season_id` on `player_groups` — is more accurate and slightly more work.

**3. No accounts in Phase 1.** Email plus display name is captured, with no password and no
login. It's the fastest path to shipping in 7 days and matches how the MVP worked. The
consequence: a player cannot return to edit their own prediction before the deadline without
some form of magic link. Worth deciding whether editing-before-lock is a Phase 1 requirement.
