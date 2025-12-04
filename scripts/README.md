# Standings Automation Scripts

Automated system for updating Premier League standings data from the Football-Data.org API.

## Core Concept

**A gameweek is complete when ALL 20 teams have played exactly that many games.**

The system ignores the fixture calendar and only looks at the actual number of games each team has played. This handles postponements and rescheduled matches correctly.

## Files

- `update-standings.js` - Main automation script
- `api-client.js` - Football-Data.org API wrapper
- `team-name-mapper.js` - Maps API team names to our format
- `validators.js` - Data validation functions
- `test-api.js` - API connectivity test script

## Usage

### Automated Updates

#### Check for and save new gameweeks
```bash
npm run update-standings
```

#### Preview what would be saved (dry run)
```bash
npm run update-standings:dry-run
```

#### Test API connection
```bash
node scripts/test-api.js
```

### Manual Override (for missed gameweeks or corrections)

#### Interactive mode (easiest)
```bash
npm run manual-override:interactive 14
```
This will prompt you to enter each team name one by one for gameweek 14.

#### Command-line mode (for scripting)
```bash
npm run manual-override 14 "Liverpool" "Arsenal" "Chelsea" "Manchester City" ... (all 20 teams)
```

#### Help
```bash
npm run manual-override --help
```
Shows all expected team names and usage instructions.

## How It Works

1. Reads last saved gameweek from `standingsByGameweek.json`
2. Fetches current standings from API
3. Determines highest complete gameweek (minimum games played across all teams)
4. Validates and saves any new complete gameweeks
5. Creates backup before modifying file

## API Configuration

- **Provider:** football-data.org
- **Rate Limit:** 10 calls/minute
- **Expected Usage:** Few calls per week
- **API Key:** Stored in `.env.local` as `FOOTBALL_API_KEY`

## Safety Features

Before saving, the script validates:
- Exactly 20 teams present
- Positions 1-20 all present (no gaps)
- No duplicate teams
- No duplicate positions
- All team names match expected format
- All teams have played the expected number of games

If any validation fails, the script will not save and will report the error.

## Backups

Backups are automatically created in `/backups` directory before any changes are made.

## Gap Tracking (Missed Gameweeks)

### What happens when gameweeks are missed?

If the automated script misses one or more gameweeks (e.g., you don't run it for a while and GW14 and GW15 both complete), the system:

1. **Detects the gap** - Recognizes that GW14 was skipped
2. **Records it** - Saves the gap to `src/data/missed-gameweeks.json`
3. **Alerts you** - Shows a warning every time the script runs
4. **Saves what it can** - Saves GW15 (the current complete gameweek)

### The missed-gameweeks.json file

This file tracks all gameweeks that need manual backfilling:

```json
{
  "missedGameweeks": [
    {
      "gameweek": 14,
      "detectedAt": "2025-12-04T10:30:00.000Z",
      "status": "needs_manual_backfill",
      "reason": "Skipped during update. Last saved: GW13, Current complete: GW15"
    }
  ],
  "lastChecked": "2025-12-04T10:30:00.000Z"
}
```

### How to handle missed gameweeks

**Option 1: Manual backfill from reliable source**
If you have reliable historical standings data (e.g., from Premier League website), use manual override:

```bash
npm run manual-override:interactive 14
```

**Option 2: Accept the gap**
If the historical data isn't critical, you can leave the gap. The app will continue working with the gameweeks that exist.

**Option 3: Remove from tracking**
If you've manually filled the gap or want to stop seeing the warning, edit `src/data/missed-gameweeks.json` and change the status to `"manually_filled"` or remove the entry.

## Automated Updates via GitHub Actions

The system includes GitHub Actions automation that runs daily to check for completed gameweeks.

### How It Works

1. Runs every day at 3 AM UTC (10 PM EST / 7 PM PST)
2. Checks if all teams have played equal number of games
3. If yes: Saves the gameweek and commits changes
4. If no: Exits cleanly (no changes)

### Setup

See [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) for complete setup instructions.

**Quick setup:**
1. Add `FOOTBALL_API_KEY` as a GitHub secret
2. Commit and push the workflow file (already created)
3. Enable GitHub Actions if needed
4. Done - runs automatically every 24 hours

### Monitoring

- View run history: GitHub > Actions tab
- Check commits: Automated runs create commits like "Auto-update: Premier League standings 2025-12-04 03:00 UTC"
- Logs: Available in Actions tab for 30 days

### Manual Trigger

You can manually trigger a run anytime:
1. Go to GitHub > Actions tab
2. Click "Update Premier League Standings"
3. Click "Run workflow"

This is useful for testing or forcing an immediate check.
