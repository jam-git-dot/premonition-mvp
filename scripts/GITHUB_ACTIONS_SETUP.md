# GitHub Actions Automation Setup Guide

## What This Does

The GitHub Actions workflow will:
- Run automatically every day at 3 AM UTC (10 PM EST / 7 PM PST)
- Check if any gameweek has been completed (all teams played equal games)
- If yes: Validate, save, and commit the update
- If no: Exit cleanly (no changes)
- Track any missed gameweeks in the gap tracker
- Create backups before any changes

## Setup Steps

### Step 1: Create Missing Data File

The workflow needs the missed-gameweeks.json file to exist:

```bash
mkdir -p src/data
echo '{
  "missedGameweeks": [],
  "lastChecked": null,
  "notes": "This file tracks gameweeks that were skipped due to automation failures or missed runs."
}' > src/data/missed-gameweeks.json
```

Or just run the update script once locally, it will create the file automatically.

### Step 2: Add GitHub Secret for API Key

1. Go to your GitHub repository
2. Click "Settings" tab
3. In left sidebar, click "Secrets and variables" > "Actions"
4. Click "New repository secret"
5. Name: `FOOTBALL_API_KEY`
6. Value: `1010b0981941444aad93cd6d3e06c995` (your API key)
7. Click "Add secret"

### Step 3: Commit the Workflow File

The workflow file is already created at `.github/workflows/update-standings.yml`.

Commit it to your repository:

```bash
git add .github/workflows/update-standings.yml
git commit -m "Add GitHub Actions workflow for automated standings updates"
git push
```

### Step 4: Enable Actions (if needed)

1. Go to your repository on GitHub
2. Click "Actions" tab
3. If prompted, click "I understand my workflows, go ahead and enable them"

### Step 5: Test Manual Run

Before waiting for the scheduled run:

1. Go to "Actions" tab on GitHub
2. Click "Update Premier League Standings" in the left sidebar
3. Click "Run workflow" dropdown
4. Click "Run workflow" button
5. Watch it run in real-time

This lets you verify everything works before the first scheduled run.

## Schedule Details

**Runs:** Every day at 3 AM UTC

**Timezone conversions:**
- EST: 10 PM (previous day)
- CST: 9 PM (previous day)
- MST: 8 PM (previous day)
- PST: 7 PM (previous day)
- GMT: 3 AM

**Why 3 AM UTC?**
- Most Premier League games finish by this time
- Low traffic period (won't interfere with users)
- API rate limits reset

## Changing the Schedule

To run more or less frequently, edit the cron schedule in `.github/workflows/update-standings.yml`:

```yaml
schedule:
  - cron: '0 3 * * *'  # Daily at 3 AM UTC
```

**Examples:**
- Twice daily: `cron: '0 3,15 * * *'` (3 AM and 3 PM UTC)
- Every 6 hours: `cron: '0 */6 * * *'`
- Only on match days: `cron: '0 3 * * 6,0,1'` (Sat, Sun, Mon)

[Cron schedule helper](https://crontab.guru/)

## What Happens When It Runs

### Scenario 1: New Gameweek Complete
```
1. Fetches standings from API
2. Detects all teams have played 14 games
3. Last saved was GW13
4. Validates GW14 data
5. Saves GW14 to standingsByGameweek.json
6. Updates lastUpdated timestamp
7. Commits and pushes changes
8. Creates artifact with logs
```

**Commit message:**
```
Auto-update: Premier League standings 2025-12-04 03:00 UTC
```

### Scenario 2: No Complete Gameweek
```
1. Fetches standings from API
2. Detects teams have 13-14 games (not all equal)
3. Last saved was GW13
4. No action needed
5. Exits cleanly
6. No commit, no changes
```

### Scenario 3: Gap Detected
```
1. Fetches standings from API
2. Detects all teams have played 15 games
3. Last saved was GW13 (missed GW14)
4. Records GW14 as missed in missed-gameweeks.json
5. Saves GW15
6. Commits both files
7. Manual backfill needed for GW14
```

## Monitoring

### View Workflow Runs
1. Go to "Actions" tab on GitHub
2. See all past runs with timestamps and status
3. Click any run to see detailed logs

### Email Notifications
GitHub sends email notifications for:
- Workflow failures
- First run after enabling

Configure in: GitHub Settings > Notifications > Actions

### Check Last Update
View the commit history on GitHub to see when standings were last updated.

## Troubleshooting

### Workflow doesn't run at scheduled time
- Check if Actions are enabled for your repo
- Verify the workflow file is on the main branch
- GitHub Actions can have slight delays (up to 15 minutes)

### Workflow fails with "API key not found"
- Verify the secret is named exactly `FOOTBALL_API_KEY`
- Check the secret value is set correctly
- Secrets are repository-specific

### Workflow runs but doesn't commit
- This is normal if no gameweek completed
- Check the logs to see what it found
- Verify all teams haven't played equal games yet

### Permission errors
The workflow needs write permissions. If it fails:
1. Go to Settings > Actions > General
2. Scroll to "Workflow permissions"
3. Select "Read and write permissions"
4. Click "Save"

## Cost

**$0** - GitHub Actions is free for public repositories.

For private repositories:
- Free tier: 2,000 minutes/month
- This workflow uses ~1 minute per run
- 30 runs/month = 30 minutes used
- Well within free tier

## Disabling

To temporarily disable:

**Option 1:** Disable the workflow
1. Go to Actions tab
2. Click the workflow name
3. Click "..." menu > "Disable workflow"

**Option 2:** Delete the workflow file
```bash
git rm .github/workflows/update-standings.yml
git commit -m "Disable automated standings updates"
git push
```

## Next Steps

After setup:
1. Test with manual run (Step 5 above)
2. Verify it commits successfully
3. Check back in 24 hours to see first scheduled run
4. Monitor for a week to ensure smooth operation
5. Consider adding Discord webhooks for notifications

## Files Modified by This Workflow

The workflow has permission to modify:
- `src/data/standingsByGameweek.json` - Adds new gameweeks
- `src/data/missed-gameweeks.json` - Tracks gaps

All other files are read-only to the workflow.
