# Manual Override Guide

## When to Use Manual Override

Use manual override when:
1. The automated system missed a gameweek
2. You need to correct an error in saved data
3. You're backfilling historical data
4. The API returned incorrect data that you want to fix

## How Manual Override Works

The manual override system provides two modes for entering data:

### Interactive Mode (Recommended)

Interactive mode prompts you for each team position one at a time, with validation at each step.

**Usage:**
```bash
npm run manual-override:interactive 14
```

**What happens:**
1. Script asks for position 1
2. You type the team name (e.g., "Liverpool")
3. Script validates the name and checks for duplicates
4. Repeats for all 20 positions
5. Shows preview of complete standings
6. Asks for confirmation before saving
7. Creates backup and saves data

**Benefits:**
- Easier to use (no need to format long command)
- Real-time validation (catches errors immediately)
- Shows remaining teams to choose from
- Prevents duplicate entries

### Command-Line Mode

For scripting or when you have all data ready.

**Usage:**
```bash
npm run manual-override 14 "Liverpool" "Arsenal" "Chelsea" "Manchester City" "Aston Villa" "Tottenham Hotspur" "Brighton & Hove Albion" "Newcastle United" "Fulham" "Manchester United" "Nottingham Forest" "Everton" "Brentford" "West Ham United" "Crystal Palace" "AFC Bournemouth" "Wolverhampton Wanderers" "Leeds United" "Sunderland" "Burnley"
```

**Requirements:**
- Must provide exactly 20 team names
- Names must be in order (position 1 through 20)
- Names must match exactly (case-sensitive)
- Use quotes for teams with spaces

## Safety Features

### 1. Overwrite Protection
If gameweek already exists, you'll see:
```
WARNING: GW14 already exists in the file.
Current data:
[shows existing standings]

Do you want to OVERWRITE this data? (y/N):
```

Press 'n' to cancel, 'y' to overwrite.

### 2. Validation
Before saving, the script checks:
- Exactly 20 teams provided
- All positions 1-20 filled (no gaps)
- No duplicate teams
- No duplicate positions
- All team names are valid

### 3. Backup
Creates timestamped backup before any changes:
```
Backup created: backups/standingsByGameweek-manual-2025-12-04T10-30-00-000Z.json
```

### 4. Confirmation
Always asks for final confirmation before saving.

## Team Names Reference

**IMPORTANT:** Team names are case-sensitive and must match exactly:

```
1.  AFC Bournemouth
2.  Arsenal
3.  Aston Villa
4.  Brentford
5.  Brighton & Hove Albion
6.  Burnley
7.  Chelsea
8.  Crystal Palace
9.  Everton
10. Fulham
11. Leeds United
12. Liverpool
13. Manchester City
14. Manchester United
15. Newcastle United
16. Nottingham Forest
17. Sunderland
18. Tottenham Hotspur
19. West Ham United
20. Wolverhampton Wanderers
```

**Common Mistakes:**
- ❌ "Man City" → ✅ "Manchester City"
- ❌ "Man United" → ✅ "Manchester United"
- ❌ "Spurs" → ✅ "Tottenham Hotspur"
- ❌ "Brighton" → ✅ "Brighton & Hove Albion" (note the &)
- ❌ "Wolves" → ✅ "Wolverhampton Wanderers"
- ❌ "Bournemouth" → ✅ "AFC Bournemouth"

## Example Workflow: Backfilling a Missed Gameweek

**Scenario:** You missed GW14 and the automated system skipped it.

**Step 1:** Check if there are gaps
```bash
npm run update-standings:dry-run
```

If gaps exist, you'll see:
```
============================================================
WARNING: MISSED GAMEWEEKS DETECTED
============================================================
The following gameweeks need manual backfill:
  GW14 - Detected at 2025-12-04T10:30:00.000Z
    Reason: Skipped during update. Last saved: GW13, Current complete: GW15

To manually fill, use: npm run manual-override 14 [rankings]
See scripts/README.md for details
============================================================
```

**Step 2:** Get the correct standings for GW14
Visit a reliable source (Premier League website, BBC Sport, etc.) and get the standings after GW14 completed.

**Step 3:** Run manual override in interactive mode
```bash
npm run manual-override:interactive 14
```

**Step 4:** Enter each team when prompted
```
Position  1: Liverpool
Position  2: Arsenal
Position  3: Chelsea
...
Position 20: Burnley
```

**Step 5:** Review the preview
The script shows you what will be saved.

**Step 6:** Confirm
Type 'y' to save.

**Step 7:** Verify
Check `src/data/standingsByGameweek.json` to confirm GW14 is now present.

The gap tracker automatically marks GW14 as manually filled.

## Troubleshooting

### Error: "Unknown team name"
- Check spelling and capitalization
- Run `npm run manual-override --help` to see the exact names
- Remember to include full names (not abbreviations)

### Error: "Duplicate teams found"
- You entered the same team twice
- In interactive mode, it prevents this automatically
- In command-line mode, double-check your team list

### Error: "Expected 21 arguments, got X"
- Command-line mode needs gameweek + 20 teams (21 total)
- Use interactive mode instead for easier input

### Script exits without saving
- Check if you answered 'n' to the confirmation prompt
- Look for validation errors in the output
- Verify all 20 team names are correct

## Advanced: Correcting Multiple Gameweeks

If you need to correct multiple gameweeks, run manual override for each one:

```bash
npm run manual-override:interactive 14
npm run manual-override:interactive 15
npm run manual-override:interactive 16
```

Each run creates a separate backup, so you can always restore if needed.
