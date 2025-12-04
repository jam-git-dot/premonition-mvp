# Quick Start Guide - Automated Standings

## What You Have Now

A fully automated system that updates Premier League standings daily. It runs in the background and only saves when all teams have played equal games.

## Enable Automation (5 minutes)

### Step 1: Add API Key to GitHub
1. Go to https://github.com/YOUR_USERNAME/premonition-mvp/settings/secrets/actions
2. Click "New repository secret"
3. Name: `FOOTBALL_API_KEY`
4. Value: Your API key (from .env.local)
5. Click "Add secret"

### Step 2: Commit and Push
```bash
git add .
git commit -m "Add automated standings update system"
git push
```

### Step 3: Test It
1. Go to https://github.com/YOUR_USERNAME/premonition-mvp/actions
2. Click "Update Premier League Standings"
3. Click "Run workflow" > "Run workflow"
4. Watch it run (takes ~30 seconds)

### Done!
The system will now run automatically every day at 3 AM UTC.

## Daily Usage

**Nothing!** It runs automatically. You can:
- Check GitHub Actions tab to see run history
- Check commits to see when standings updated
- Relax knowing it's handled

## When You Need to Intervene

### If You See a Gap Warning
```bash
npm run manual-override:interactive 14
```
Follow the prompts to backfill the missed gameweek.

### To Manually Check Right Now
```bash
npm run update-standings:dry-run
```
See what would happen without actually saving.

### To Force an Update Now
```bash
npm run update-standings
```
Runs the same logic as GitHub Actions, but locally.

## Monitoring

### Check Last Update
Look at your repository commits for:
```
Auto-update: Premier League standings 2025-12-04 03:00 UTC
```

### Check for Errors
- Go to GitHub > Actions tab
- Red X = failed run (check logs)
- Green checkmark = successful run

### Check for Gaps
The system will alert you in the logs if it detects missed gameweeks.

## Common Questions

**Q: When does it run?**
A: Every day at 3 AM UTC (10 PM EST, 7 PM PST)

**Q: Will it update every day?**
A: No, only when a new gameweek completes (all teams equal games).

**Q: What if multiple gameweeks complete between runs?**
A: It saves the latest one and tracks the missed ones for manual backfill.

**Q: Can I change the schedule?**
A: Yes, edit `.github/workflows/update-standings.yml` and change the cron schedule.

**Q: Does it cost anything?**
A: No, completely free.

**Q: Can I disable it?**
A: Yes, go to Actions tab > workflow name > "..." > "Disable workflow"

## Files to Keep an Eye On

- `src/data/standingsByGameweek.json` - Your standings data
- `src/data/missed-gameweeks.json` - Tracks any gaps

Both are automatically managed by the system.

## Getting Help

All documentation is in the `scripts/` directory:
- `README.md` - Full system documentation
- `GITHUB_ACTIONS_SETUP.md` - Detailed automation setup
- `MANUAL_OVERRIDE_GUIDE.md` - How to manually fill gaps
- `DISCORD_WEBHOOK_IMPLEMENTATION.md` - Future: notifications

## What's Next

Your system is production-ready. Optional enhancements:
- Add Discord webhooks for phone notifications (30 min)
- Build admin dashboard to view logs (2-3 hours)
- Set up email alerts (1 hour)

But these are optional - the core system is complete and running!
