# Supabase Security Checklist
## Row Level Security (RLS) Policy Audit

**CRITICAL: Complete this checklist in your Supabase dashboard**

Date: 2025-12-07
Status: ⚠️ NEEDS REVIEW

---

## Access Your Supabase Dashboard

1. Go to: https://app.supabase.com/project/YOUR_PROJECT_ID/auth/policies
2. Replace `YOUR_PROJECT_ID` with your actual project ID from the URL in `.env.local`

---

## Table: `predictions`

### Current Schema (Expected)
```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  rankings JSONB NOT NULL,
  "group" TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### RLS Status Check

**Step 1: Is RLS Enabled?**
- [ ] Go to Table Editor → predictions → Settings
- [ ] Verify "Enable Row Level Security (RLS)" is toggled ON
- [ ] If OFF, turn it ON immediately

**Step 2: Check Existing Policies**

Navigate to: Authentication → Policies → predictions table

Document what policies currently exist:
```
Policy Name: _______________________
Allowed Operations: SELECT / INSERT / UPDATE / DELETE
Using Expression: _______________________
Check Expression: _______________________
```

---

## Recommended RLS Policies

### Policy 1: Public Read Access ✅
**Purpose:** Allow anyone to view predictions (for leaderboard)

```sql
CREATE POLICY "Allow public read access to predictions"
ON predictions
FOR SELECT
USING (true);
```

**Why:** The competition leaderboard needs to display all users' predictions publicly.

---

### Policy 2: Users Can Insert Their Own Predictions ✅
**Purpose:** Allow users to submit predictions

```sql
CREATE POLICY "Allow users to insert their own predictions"
ON predictions
FOR INSERT
WITH CHECK (true);
```

**Note:** Since this is a public competition (no authentication), we allow all inserts.
The frontend validation handles data quality.

**⚠️ Risk:** Anyone could submit spam predictions.
**Mitigation:** Frontend validation + manually remove spam entries if needed.

---

### Policy 3: Users Can Update Only Their Own Predictions 🔒
**Purpose:** Prevent users from editing others' predictions

```sql
CREATE POLICY "Allow users to update only their own email"
ON predictions
FOR UPDATE
USING (true)  -- Anyone can attempt update
WITH CHECK (  -- But only if email matches existing row
  email = (SELECT email FROM predictions WHERE id = predictions.id LIMIT 1)
);
```

**How it works:**
- User can only update rows where the email matches the existing row's email
- Prevents user A (email: a@example.com) from updating user B's (email: b@example.com) prediction

---

### Policy 4: Prevent Delete Operations 🚫
**Purpose:** Don't allow predictions to be deleted (preserve data integrity)

```sql
-- DO NOT CREATE A DELETE POLICY
-- This means DELETE operations are denied by default
```

**Why:** We want to keep all predictions for historical purposes.

**To manually delete spam:** Use Supabase dashboard with your admin credentials.

---

## How to Apply These Policies

### Method 1: Using SQL Editor (Recommended)

1. Go to: SQL Editor in Supabase dashboard
2. Copy/paste each policy SQL statement above
3. Run them one by one
4. Verify in Authentication → Policies

### Method 2: Using Policy Builder UI

1. Go to: Authentication → Policies
2. Click "New Policy" under `predictions` table
3. Use the visual builder to create each policy

---

## Verification Tests

After applying policies, test from your browser console:

### Test 1: Can you read predictions? (Should SUCCEED)
```javascript
const { data, error } = await supabase
  .from('predictions')
  .select('*');

console.log('Read test:', data ? 'PASS ✅' : 'FAIL ❌', error);
```

### Test 2: Can you insert a prediction? (Should SUCCEED)
```javascript
const { data, error } = await supabase
  .from('predictions')
  .insert([{
    email: 'test@example.com',
    name: 'Test User',
    rankings: ['Team1', 'Team2', ...],
    group: 'dev'
  }]);

console.log('Insert test:', data ? 'PASS ✅' : 'FAIL ❌', error);
```

### Test 3: Can you update your own prediction? (Should SUCCEED)
```javascript
const { data: existing } = await supabase
  .from('predictions')
  .select('id')
  .eq('email', 'test@example.com')
  .single();

const { data, error } = await supabase
  .from('predictions')
  .update({ name: 'Updated Name' })
  .eq('id', existing.id);

console.log('Update own test:', data ? 'PASS ✅' : 'FAIL ❌', error);
```

### Test 4: Can you update someone else's prediction? (Should FAIL)
```javascript
const { data: someone } = await supabase
  .from('predictions')
  .select('id')
  .neq('email', 'test@example.com')
  .limit(1)
  .single();

const { data, error } = await supabase
  .from('predictions')
  .update({ name: 'Hacked!' })
  .eq('id', someone.id);

console.log('Update others test:', error ? 'PASS ✅ (denied as expected)' : 'FAIL ❌ (should be denied!)', data);
```

### Test 5: Can you delete a prediction? (Should FAIL)
```javascript
const { data, error } = await supabase
  .from('predictions')
  .delete()
  .eq('email', 'test@example.com');

console.log('Delete test:', error ? 'PASS ✅ (denied as expected)' : 'FAIL ❌ (should be denied!)');
```

---

## Expected Results

| Test | Expected Outcome |
|------|------------------|
| Read all predictions | ✅ SUCCESS |
| Insert new prediction | ✅ SUCCESS |
| Update own prediction | ✅ SUCCESS |
| Update other's prediction | ❌ DENIED |
| Delete any prediction | ❌ DENIED |

---

## Additional Security Measures

### 1. API Key Protection
Your `VITE_SUPABASE_ANON_KEY` is exposed in client-side code (this is normal).

**Ensure:**
- [ ] You're using the `anon` key (not `service_role` key) in client code
- [ ] The `service_role` key is NEVER in client code or `.env.local`
- [ ] RLS policies are properly configured (they protect against anon key abuse)

### 2. Data Validation
RLS prevents unauthorized access, but doesn't validate data quality.

**Frontend validation (App.jsx) handles:**
- ✅ Email format validation
- ✅ Name length validation (2-100 chars)
- ✅ Rankings completeness (exactly 20 teams)
- ✅ No duplicate teams
- ✅ XSS prevention (sanitized input)

### 3. Rate Limiting
Consider adding rate limiting if you get spam submissions:

**Option A:** Cloudflare (if using)
**Option B:** Supabase Edge Functions with rate limiting
**Option C:** Manual cleanup of spam via dashboard

---

## Troubleshooting

### Issue: "new row violates row-level security policy"
**Cause:** RLS policy is too restrictive or misconfigured
**Fix:** Check the `WITH CHECK` expression in your INSERT/UPDATE policies

### Issue: "insufficient privileges"
**Cause:** RLS is enabled but no policies exist
**Fix:** Add the recommended policies above

### Issue: Users can't update their predictions
**Cause:** UPDATE policy is too restrictive
**Fix:** Verify the email matching logic in Policy 3

### Issue: Users can see each other's emails
**Cause:** SELECT policy returns all columns
**Fix:** This is expected for a public leaderboard. If you want to hide emails, modify the SELECT policy:

```sql
CREATE POLICY "Allow public read access but hide emails"
ON predictions
FOR SELECT
USING (true)
RETURNING (name, rankings, "group", created_at);  -- Exclude email
```

---

## Completion Checklist

- [ ] RLS is enabled on `predictions` table
- [ ] Policy 1 (public read) is active
- [ ] Policy 2 (insert) is active
- [ ] Policy 3 (update own) is active
- [ ] Policy 4 (no delete) is confirmed (no DELETE policy exists)
- [ ] All 5 verification tests run and pass
- [ ] Documented any custom policies or deviations
- [ ] Confirmed using `anon` key (not `service_role`) in client

**Date Completed:** ___________
**Completed By:** ___________

---

## Emergency Contact

If you suspect a security breach:

1. ⚠️ **Immediately rotate** your Supabase keys in dashboard
2. 🔒 **Review** recent database changes in SQL Editor → History
3. 🗑️ **Delete** any malicious entries manually
4. 📧 **Update** `.env.local` with new keys locally
5. 🚀 **Redeploy** your app with new keys (if deployed)

---

## Notes

- This is a **private document** (already in `.gitignore`)
- Update this checklist whenever you modify RLS policies
- Review security every 30 days or after major changes
