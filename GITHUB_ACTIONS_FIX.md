# GitHub Actions Discord Bot Fix

## Problem
GitHub Actions workflow was running but Discord notifications weren't being sent.

## Root Cause
The `DISCORD_WEBHOOK_URL` secret was not configured in GitHub repository secrets, and the workflow wasn't passing it to the update script.

## Fixes Applied

### 1. Updated GitHub Actions Workflow (`.github/workflows/update-standings.yml`)
- **Added** `DISCORD_WEBHOOK_URL` environment variable to the update script step
- **Removed** `continue-on-error: true` so failures are visible
- **Added** `scoresByGameweek.json` to files committed (was being generated but not saved)

### 2. Created Test Workflow (`.github/workflows/test-update.yml`)
- Manual trigger only
- Runs in dry-run mode (won't commit changes)
- Tests API connectivity and Discord notifications
- Useful for debugging without affecting production data

## Required Action: Add GitHub Secret

**You must add the Discord webhook URL to GitHub secrets:**

1. Go to: https://github.com/jam-git-dot/premonition-mvp/settings/secrets/actions
2. Click "New repository secret"
3. Name: `DISCORD_WEBHOOK_URL`
4. Value: `https://discord.com/api/webhooks/1447261267969573088/3y02XIy7cf_mW11ExaUzJkD3QYquYpUQjcHG36lE3xZvZc96MAo6eqwTvzetRBJPQEyp`
5. Click "Add secret"

## Testing

After adding the secret:

1. Go to: https://github.com/jam-git-dot/premonition-mvp/actions
2. Click on "Test Update Script (Manual)" workflow
3. Click "Run workflow" → "Run workflow"
4. Watch the logs to verify:
   - API connection works
   - Discord notification is sent
   - No errors occur

## Files Changed
- `.github/workflows/update-standings.yml` - Fixed to include Discord webhook
- `.github/workflows/test-update.yml` - New test workflow (manual trigger only)

## Next Steps
1. Add the `DISCORD_WEBHOOK_URL` secret to GitHub
2. Run the test workflow manually to verify it works
3. Wait for the next scheduled run (daily at 3 AM UTC) or manually trigger the main workflow
