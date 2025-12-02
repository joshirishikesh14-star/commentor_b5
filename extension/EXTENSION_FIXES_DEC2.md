# Extension Fixes - December 2, 2025

## Issues Fixed

### 1. Domain Matching Issue (www prefix)
**Problem:** Extension showed "Wrong domain! This app is for osmos.ai, but you're on www.osmos.ai"

**Root Cause:** Domain comparison was exact match, not accounting for www subdomain

**Fix Applied:**
- Added `normalizeDomain()` function that removes "www." prefix and converts to lowercase
- Applied to both `content.js` and `popup.js`
- Now `osmos.ai` === `www.osmos.ai`

**Files Changed:**
- `extension/content.js` - Added normalizeDomain() and updated getCurrentDomain()
- `extension/popup.js` - Added normalizeDomain() and updated extractDomain()

---

### 2. FAB Button Not Visible
**Problem:** FAB (Floating Action Button) wasn't appearing in review mode

**Root Cause:**
- document.body might not be ready when showReviewFAB() was called
- No retry mechanism if body wasn't available

**Fix Applied:**
- Added check for `document.body` existence
- Added automatic retry with 100ms delay if body not ready
- Added comprehensive console logging to track FAB creation
- Added check to show existing FAB if already created

**Files Changed:**
- `extension/content.js` - Updated showReviewFAB() with retry logic and logging

---

### 3. Comments From Other Apps Showing Up
**Problem:** User seeing comments from other apps in current app

**Root Analysis:**
- The query already filters by `app_id`:
  ```javascript
  threads?app_id=eq.${activeSession.appId}&page_url=eq....
  ```
- This means the issue is likely one of:
  1. Multiple apps with same domain (now fixed by domain normalization)
  2. Shared app not being detected correctly
  3. App ID not being set correctly

**Fix Applied:**
- Enhanced logging to show which app ID is being used for queries
- Added logging to show all available apps during auto-detect
- Comments are already isolated by app_id in the database query

**Verification Steps:**
1. Check browser console for log: `📥 Echo: Loading comments for app ID: [ID]`
2. Verify the app ID matches the app you're viewing
3. Check if multiple apps share the same base_url

---

### 4. Shared App Detection
**Problem:** Shared apps not being detected in auto-detect

**Current Implementation:**
```javascript
async function fetchUserApps(authData) {
  // Fetches from:
  // 1. workspace_members → workspace apps
  // 2. app_collaborators → shared apps
  // Combines both lists
}
```

**Fix Applied:**
- Added detailed logging to show all apps found
- Added logging to show which app is matched
- Added logging to show app details (id, name, base_url)

**Verification:**
Check console for:
```
✅ Echo: Auto-detected app: [name] (ID: [id]) for domain: [domain]
📱 Echo: App details: { id, name, base_url }
```

Or if not found:
```
🔍 Echo: No matching app for domain: [domain]
📋 Echo: Available apps: [list of apps with domains]
```

---

## New Console Logging

### Auto-Detect Flow:
```
🔍 Echo: User not logged in, skipping auto-detect
🔍 Echo: Fetching user apps for auto-detect...
🔍 Echo: No apps found for user
✅ Echo: Auto-detected app: [name] (ID: [id]) for domain: [domain]
📱 Echo: App details: { id, name, base_url }
🔍 Echo: No matching app for domain: [domain]
📋 Echo: Available apps: [list]
❌ Echo: Auto-detect error: [error]
```

### Review Mode Activation:
```
👁️ Echo: Entering review mode for [app name]
✅ Echo: Review mode activated, FAB should be visible
```

### FAB Creation:
```
📌 Echo: FAB button already exists
📌 Echo: Creating FAB button
⏳ Echo: document.body not ready, retrying...
✅ Echo: FAB button added to DOM
```

### Comment Loading:
```
⚠️ Echo: No active session, skipping comment load
📥 Echo: Loading comments for app ID: [id]
📍 Echo: Current page URL: [url]
📍 Echo: Found [N] comments on this page
📊 Echo: Total [N] comments across all pages
```

---

## Testing Checklist

### For Owned Apps:
- [ ] Visit app URL (e.g., osmos.ai or www.osmos.ai)
- [ ] Check console for auto-detect logs
- [ ] Verify FAB button appears in bottom-right
- [ ] Click FAB to see comments panel
- [ ] Verify only comments for THIS app appear

### For Shared Apps:
- [ ] Visit shared app URL
- [ ] Check console: should auto-detect the shared app
- [ ] Verify FAB button appears
- [ ] Verify only comments for the shared app appear
- [ ] Check console log for app ID being used

### Domain Variations:
- [ ] Test with `example.com`
- [ ] Test with `www.example.com`
- [ ] Both should work without "Wrong domain" warning

---

## Troubleshooting

### FAB Button Still Not Visible?
Check console for:
1. `📌 Echo: Creating FAB button`
2. `✅ Echo: FAB button added to DOM`

If missing, check:
- Is auto-detect finding the app?
- Is review mode being entered?
- Are there any JavaScript errors?

### Wrong Comments Showing?
Check console for:
- `📥 Echo: Loading comments for app ID: [ID]`
- Verify this ID matches the app you expect

If ID is wrong:
- Check which app is being auto-detected
- Verify the app's base_url matches current domain

### Shared App Not Detected?
Check console for:
- `📋 Echo: Available apps: [list]`
- Verify the shared app is in this list
- Verify the domain matches

If app not in list:
- Check user has been added to app_collaborators in database
- Check app is_active = true
- Try refreshing the page to clear cache

---

## Known Limitations

1. **Multiple Apps Same Domain:**
   - If multiple apps have the same base_url, the first one found will be used
   - Solution: Use more specific URLs or different subdomains

2. **Dynamic Domains:**
   - If app domain changes after page load, auto-detect won't trigger again
   - Solution: Reload the page

3. **Cache:**
   - User apps are cached in chrome.storage.local
   - May need to reload if apps are added/shared externally
   - Cache clears on login/logout

---

## Database Schema Requirements

For shared apps to work, ensure:

```sql
-- App collaborators table should exist
CREATE TABLE app_collaborators (
  id uuid PRIMARY KEY,
  app_id uuid REFERENCES apps(id),
  user_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- With proper RLS policies
CREATE POLICY "Users can view their collaborations"
  ON app_collaborators FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

---

## Files Modified

1. **extension/content.js**
   - Added `normalizeDomain()` function
   - Updated `getCurrentDomain()` to use normalizeDomain
   - Updated `autoDetectApp()` domain comparison
   - Updated `showReviewFAB()` with retry logic
   - Added comprehensive console logging throughout
   - Made `enterReviewMode()` async to await comment loading

2. **extension/popup.js**
   - Added `normalizeDomain()` function
   - Updated `extractDomain()` to use normalizeDomain
   - Domain comparison now handles www prefix

---

## Next Steps

1. **Load the updated extension:**
   - Go to `chrome://extensions/`
   - Click "Reload" on Echo extension
   - Or remove and re-add from `extension` folder

2. **Test on both owned and shared apps:**
   - Check console logs at each step
   - Verify FAB appears
   - Verify correct comments load

3. **If issues persist:**
   - Share console logs (look for 🔍 ✅ ⚠️ ❌ emoji markers)
   - Check network tab for failed API requests
   - Verify database has correct data

---

## Support

For issues, check:
1. Browser console logs (look for Echo emoji markers)
2. Network tab for API errors
3. Supabase logs for RLS policy issues
4. Database to verify app_collaborators entries
