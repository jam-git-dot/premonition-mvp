# Edge Case Testing Documentation

## Edge Cases Handled

### 1. Duplicate Prevention
**Scenario:** GW13 already exists in file, script tries to save GW13 again
**Behavior:** Script detects existing entry and refuses to overwrite
**Code:** Lines 226-235 in update-standings.js
```
if (currentData[gameweekToSave]) {
  console.log('WARNING: GW already exists...');
  return; // Exits without overwriting
}
```

### 2. Missing Multiple Gameweeks
**Scenario:** Last saved is GW13, but GW15 is now complete (missed GW14)
**Behavior:**
- Warns user that GW14 was missed
- Saves GW15 only (can't reconstruct GW14 from current API data)
- Logs clear message about the limitation

**Code:** Lines 201-211 in update-standings.js

**Why:** The API only returns CURRENT standings. If all teams have played 15 games, we can't determine what the standings were when they had played 14 games.

### 3. No New Gameweeks
**Scenario:** Script runs but no new complete gameweeks exist
**Behavior:**
- Checks API (1 call)
- Detects no changes needed
- Exits gracefully with clear message
- No file modifications, no backups created

**Code:** Lines 179-198 in update-standings.js

### 4. Partial Gameweek
**Scenario:** 18 teams played 14 games, 2 teams still on 13 games
**Behavior:**
- Detects highestComplete = 13 (minimum games played)
- If GW13 already saved, reports no action needed
- Does NOT save partial GW14 data

**Code:** Lines 93-107 in update-standings.js (getHighestCompleteGameweek)

### 5. API Validation Failures
**Scenario:** API returns invalid data (wrong team count, duplicates, etc.)
**Behavior:**
- Validation catches the issue before saving
- Logs specific error
- Does NOT save corrupt data
- Exits with error status

**Code:** validators.js (all functions)

### 6. Network Failures
**Scenario:** API request fails due to network issues
**Behavior:**
- Retries 3 times with exponential backoff (1s, 2s, 4s)
- Only fails after all retries exhausted
- Logs attempt number and wait time

**Code:** Lines 30-50 in api-client.js

## Comparison to Manual Updates

### Manual Process
1. Check when all teams have played X games
2. Copy current standings
3. Paste into JSON file at gameweek X
4. Update lastUpdated timestamp
5. Save file

### Automated Process (Better Than Manual)
1. **Same logic:** Checks when all teams played X games
2. **Better validation:** Checks for 20 teams, positions 1-20, no duplicates, correct names
3. **Automatic backup:** Creates timestamped backup before any changes
4. **Duplicate prevention:** Won't overwrite existing gameweeks
5. **Consistency:** Always uses exact team name mapping
6. **Error recovery:** Network retry logic
7. **Audit trail:** Detailed logs of every action
8. **Dry-run mode:** Preview changes before committing

### What Manual Process Can Do That Automated Can't
- Manually reconstruct historical gameweeks if you missed them
- Override validation if you know the data is correct despite errors
- Save partial gameweeks for testing purposes

### Recommendation
Run the automated script regularly (daily or every few days) to avoid missing gameweeks, since historical reconstruction is not possible with the current API.

## Testing Scenarios

### Test 1: Normal Operation (GW14 completes)
```bash
# When Man United and West Ham finish their 14th game
npm run update-standings:dry-run
# Should show: "Gameweek to save: GW14"
# Should show preview of GW14 standings
```

### Test 2: Re-run Same Gameweek
```bash
# After GW14 is saved, run again immediately
npm run update-standings:dry-run
# Should show: "GW14 is the latest complete gameweek (already saved)"
# Should make 1 API call and exit
```

### Test 3: Missed Gameweek
```bash
# Simulate by manually deleting GW13 from JSON, then GW15 completes
npm run update-standings:dry-run
# Should show: "WARNING: Multiple gameweeks have completed"
# Should show: "Missed gameweeks: 14 through 14"
# Should save: GW15 only
```

### Test 4: API Down
```bash
# Unplug network or use invalid API key
npm run update-standings:dry-run
# Should show: "Request failed, retrying in..."
# Should attempt 3 times before failing
```

## Safety Guarantees

1. **Never overwrites existing data** (unless you manually delete it first)
2. **Always creates backup** before modifying file
3. **Validates ALL data** before saving
4. **Only saves complete gameweeks** (all 20 teams equal games)
5. **Only makes 1-2 API calls** per run (well under 10/minute limit)
6. **Dry-run mode** lets you preview without risk
7. **No code execution from API data** (only reads JSON)
8. **Explicit error messages** with actionable information
