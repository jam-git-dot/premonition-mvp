# Premonition MVP - Architecture Documentation

## Data Flow & Single Source of Truth

This document explains how data flows through the system and where each piece of data comes from.

## Core Principle: Single Source of Truth

**Every piece of data has exactly ONE authoritative source.** All consumers read from that source. No fallbacks, no dual systems, no silent calculations.

---

## Data Sources

### 1. Premier League Standings (`standingsByGameweek.json`)

**Source**: Football-Data.org API → `update-standings.js` automation
**Format**: `{ "1": { "1": "Arsenal", "2": "Man City", ... }, "2": { ... }, ... }`
**Update Frequency**: Daily at 3 AM UTC via GitHub Actions
**Consumers**:
- Frontend (`useCompetitionData` hook)
- Score calculation scripts
- Health check validation

**Truth**: This is the ONLY source for Premier League table data. If a gameweek isn't here, it doesn't exist in the system.

---

### 2. Competition Scores (`scoresByGameweek.json`)

**Source**: Calculated from standings during automation (`update-standings.js` line 316-347)
**Format**: `{ "1": [{name: "Player", totalScore: 45, teamScores: {...}}, ...], "2": [...], ... }`
**Update Frequency**: Automatically when new standings are added
**Consumers**:
- Frontend (`useCompetitionData` hook) - **ONLY reads from this file**
- Week-over-week comparison
- Leaderboard displays

**Truth**: This is the ONLY source for player scores. Scores are **NEVER** calculated on-the-fly in the frontend. If scores are missing here, the feature will fail visibly (not silently).

**Calculation Logic**:
```javascript
// For each player:
totalScore = sum of |predictedPosition - actualPosition| for all 20 teams
```

---

### 3. Player Predictions (`competitionData.js`)

**Source**: Manually coded array `realPredictions`
**Format**: `[{name: "Player", groups: ["LIV"], rankings: ["Liverpool", "Arsenal", ...]}, ...]`
**Update Frequency**: Manual (when new players join)
**Consumers**:
- Score calculation (compares predictions to standings)
- Group filtering
- Consensus calculations

**Truth**: This is the ONLY source for what each player predicted. Immutable after season start.

---

## Data Flow Diagram

```
┌─────────────────────┐
│  Football-Data API  │
│ (External, Read-Only)│
└──────────┬──────────┘
           │ Daily at 3 AM UTC
           ▼
┌─────────────────────────────┐
│  update-standings.js        │
│  (GitHub Actions Automation)│
│                             │
│  1. Fetch current standings │
│  2. Detect complete gameweek│
│  3. Save to JSON ──────────┼──► standingsByGameweek.json
│  4. Calculate scores        │
│  5. Save to JSON ──────────┼──► scoresByGameweek.json
│  6. Commit & push          │
│  7. Notify Discord         │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  GitHub Repository          │
│  (Version Controlled)       │
│                             │
│  • standingsByGameweek.json │
│  • scoresByGameweek.json    │
└──────────┬──────────────────┘
           │ Deployed via Vercel
           ▼
┌─────────────────────────────┐
│  Frontend (React)           │
│  useCompetitionData hook    │
│                             │
│  Reads from:                │
│  ✅ standingsByGameweek.json│
│  ✅ scoresByGameweek.json   │
│  ✅ realPredictions array   │
│                             │
│  Displays:                  │
│  • Current standings        │
│  • Player leaderboard       │
│  • Week-over-week changes   │
└─────────────────────────────┘
```

---

## Critical Rules

### ✅ DO:
- Read standings from `standingsByGameweek.json`
- Read scores from `scoresByGameweek.json`
- Fail loudly if data is missing
- Log errors to console
- Report issues to Discord

### ❌ DON'T:
- Calculate scores in the frontend
- Use fallback calculations
- Silently handle missing data
- Cache or duplicate data sources
- Skip validation checks

---

## What Happens When...

### A new gameweek completes?

1. **GitHub Actions triggers** `update-standings.js` at 3 AM UTC
2. Script fetches standings from API
3. Detects all teams have played same number of games
4. Saves new gameweek to `standingsByGameweek.json`
5. **Immediately calculates scores** for new gameweek
6. Saves scores to `scoresByGameweek.json`
7. Commits both files to git
8. Pushes to GitHub → triggers Vercel deployment
9. Sends Discord notification with:
   - New gameweek number
   - Top 3 teams
   - Top 3 players
   - Biggest position changes

### Scores are missing for a gameweek?

1. **Frontend will show error** in console: "No scores found for GW[X]"
2. **Week-over-week comparison will fail**
3. **Health check will detect and report** missing scores
4. **Manual fix required**: Run `npm run recalculate-scores [gameweek]`

### The automation fails?

1. **GitHub Actions will show failed run**
2. **Discord receives error notification**
3. **Data files won't be updated** (transaction-like behavior)
4. **Previous gameweek data remains intact**

---

## File Locations

| File | Path | Purpose |
|------|------|---------|
| Standings Data | `src/data/standingsByGameweek.json` | Premier League tables by gameweek |
| Scores Data | `src/data/scoresByGameweek.json` | Pre-calculated player scores |
| Predictions | `src/data/competitionData.js` | Player predictions (static) |
| Frontend Hook | `src/hooks/useCompetitionData.js` | Loads data for UI |
| Automation | `scripts/update-standings.js` | Fetches & saves new data |
| Score Calculator | `src/data/competitionData.js` | `calculateCompetitionScoresForWeek()` |

---

## Common Issues & Solutions

### "Week-over-week comparison shows 'No Data'"
**Cause**: `scoresByGameweek.json` is missing scores for current or previous week
**Fix**: Run `npm run recalculate-scores [gameweek]` for missing weeks

### "Standings updated but scores didn't"
**Cause**: Score calculation failed in `update-standings.js` (line 316-347)
**Fix**: Check GitHub Actions logs for errors, manually recalculate if needed

### "Frontend shows old scores"
**Cause**: Vercel deployment hasn't updated yet or browser cache
**Fix**: Hard refresh (Cmd+Shift+R) or wait for Vercel deployment

---

## Validation & Health Checks

Run `npm run health-check` to verify:
- ✅ Environment variables configured (API key, Discord webhook, Supabase)
- ✅ Data files are valid JSON
- ✅ All gameweeks have standings (no gaps in sequence)
- ✅ All gameweeks have 20 teams
- ✅ All gameweeks have scores (matches standings)
- ✅ **Score accuracy verification** - Independently recalculates scores for latest gameweek and compares
- ✅ Week-over-week comparison data availability
- ✅ API connectivity and data freshness
- ✅ Discord webhook format validation
- ✅ Supabase configuration validation

**Single Source of Truth**: The health check is the authoritative system status validator. It reads from scoresByGameweek.json (never calculates on-the-fly) and independently verifies accuracy by recalculating a spot-check gameweek.

---

## Version History

**v2 (Current)**: Single source of truth architecture
- Frontend reads from scoresByGameweek.json ONLY
- No fallback calculations
- Scores are critical, not optional

**v1 (Deprecated)**: Dual system with fallback
- Frontend calculated scores on-the-fly if file missing
- Masked automation failures
- Inconsistent data between users
