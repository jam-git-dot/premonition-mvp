# Discord Webhook Implementation Plan

## Overview
Add Discord webhook notifications to the standings automation system so you can monitor updates from any device (phone, desktop, etc.).

## What You'll Get

Automatic Discord messages for:
1. Successful gameweek updates
2. Gap detection warnings
3. Errors and failures
4. Manual override confirmations

## Setup Steps (When Ready to Implement)

### Step 1: Create Discord Server & Webhook (5 minutes)

1. **Create a Discord server** (if you don't have one)
   - Open Discord
   - Click the "+" button
   - Select "Create My Own" > "For me and my friends"
   - Name it "Premonition Monitoring" or similar

2. **Create a webhook**
   - Right-click your server name
   - Select "Server Settings" > "Integrations" > "Webhooks"
   - Click "New Webhook"
   - Name it "Standings Bot"
   - Select a channel (create one called "standings-logs")
   - Click "Copy Webhook URL"

3. **Save the webhook URL**
   - Add to `.env.local`:
     ```
     DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
     ```

### Step 2: Implementation (15-20 minutes)

Create `scripts/discord-notifier.js` with functions:
- `notifySuccess(gameweek, stats)` - Successful update
- `notifyGap(missedGameweeks)` - Gap detected
- `notifyError(error)` - Failures
- `notifyManualOverride(gameweek)` - Manual fills

### Step 3: Integration

Update these files to call Discord notifications:
- `update-standings.js` - Add notifications for success/failure/gaps
- `manual-override.js` - Add notification on manual fill
- `gap-tracker.js` - Add notification when gaps detected

### Step 4: Testing

Run with a test webhook to verify messages format correctly.

## Example Notifications

### Success Message
```
✅ Standings Updated Successfully

Gameweek: 14
Time: Dec 4, 2025 10:30 AM UTC
API Calls Used: 1/10
Status: SUCCESS

Top 3:
1. Liverpool
2. Arsenal
3. Chelsea
```

### Gap Warning
```
⚠️ GAP DETECTED - Action Required

Missed Gameweeks: 14
Last Saved: GW13
Current Complete: GW15

The automation skipped GW14 because multiple gameweeks completed between runs.

ACTION REQUIRED: Manual backfill needed
Run: npm run manual-override:interactive 14
```

### Error Alert
```
❌ Update Failed

Error: API validation failed - wrong team count
Gameweek: 14
Time: Dec 4, 2025 10:30 AM UTC

The system did NOT save any data (fail-safe protection).
Check the logs for details.
```

### Manual Override Confirmation
```
🔧 Manual Override Completed

Gameweek: 14
Method: Interactive Mode
Operator: Manual Entry
Time: Dec 4, 2025 11:00 AM UTC

Backup Created: ✅
Validation Passed: ✅
Status: SAVED
```

## Benefits

1. **Monitor from anywhere** - Check your phone, no need to log into server
2. **Instant alerts** - Know immediately when something goes wrong
3. **Audit trail** - Permanent record of all updates in Discord
4. **No infrastructure** - Discord handles everything, 100% free
5. **Rich formatting** - Color-coded messages, easy to scan

## Optional Enhancements

### Rich Embeds (prettier messages)
Use Discord's embed format for color-coded, formatted messages:
- Green for success
- Yellow for warnings
- Red for errors

### @mention on errors
Configure to ping you when critical errors occur.

### Daily summary
Send a summary message once per day:
"Last 24 hours: 0 updates, 0 errors, System healthy ✅"

## Cost

**$0** - Completely free. Discord webhooks have generous rate limits (30 requests per minute), far more than we need.

## Privacy/Security

- Webhook URL is secret, acts like a password
- Only people with the URL can post to your channel
- Keep it in `.env.local` (which is gitignored)
- Never commit webhook URL to git

## When to Implement

Good time to add this:
1. After GitHub Actions automation is working
2. When you want remote monitoring
3. Before deploying to production
4. Anytime you want peace of mind

## Estimated Time

- Initial setup: 20-30 minutes
- Testing: 10 minutes
- **Total: 30-40 minutes**

No ongoing maintenance required once set up.
