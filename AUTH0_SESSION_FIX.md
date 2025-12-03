# Auth0 Session Fix - Proper RLS Support

## 🎯 Problem Summary

When Auth0 users logged in, they were correctly linked to their existing Supabase profiles by email, but they **could not access their existing workspace data**. This caused:

1. ❌ `WorkspaceContext` failed to load workspaces
2. ❌ RLS policies blocked database queries (checking `auth.uid()` which was null)
3. ❌ Users saw "Create Workspace" screen instead of their dashboard
4. ❌ Attempting to create a workspace failed with "duplicate key" error

**Root Cause:** Auth0 users didn't have a Supabase session, so `auth.uid()` returned null, blocking all RLS policies.

---

## ✅ Solution Implemented

### Approach: **Supabase Session Creation for Auth0 Users**

Instead of granting overly permissive `anon` access (security risk), we now:

1. **Auth0 login succeeds** → Get Auth0 user data
2. **Edge Function creates:**
   - Profile in `profiles` table (linked by email)
   - Supabase auth user (with auto-confirmed email)
   - Verification token (magic link token)
3. **Client verifies token** → Creates proper Supabase session
4. **User now has `auth.uid()`** → All RLS policies work normally

---

## 🔧 Changes Made

### 1. **Edge Function: `auth0-create-session`**
- **Location:** `supabase/functions/auth0-create-session/index.ts`
- **Purpose:** Creates Supabase auth user and verification token for Auth0 users
- **What it does:**
  1. Calls `create_or_update_auth0_profile` to sync profile by email
  2. Creates or updates Supabase auth user with matching email
  3. Generates magic link token
  4. Returns profile ID and verification token

### 2. **Updated `AuthContext`**
- **File:** `src/contexts/AuthContext.tsx`
- **Changes:**
  - `syncAuth0UserToProfile` now calls the edge function
  - Uses `supabase.auth.verifyOtp()` with returned token
  - Creates proper Supabase session for Auth0 users
  - Sets `authProvider: 'supabase'` when session is created

### 3. **Fixed `WorkspaceContext`**
- **File:** `src/contexts/WorkspaceContext.tsx`
- **Changes:**
  - Added null checks for `initialWorkspace`
  - Prevents crash when workspace data is empty

### 4. **Database Migrations**
- ✅ Granted `anon` execute access to workspace functions (for initial API calls)
- ✅ Rolled back overly permissive RLS policies

---

## 🎯 How It Works Now

### New User Flow (Auth0)

1. User clicks **"Sign in with Google"** (Auth0)
2. Auth0 authenticates and redirects back
3. `AuthContext` calls `syncAuth0UserToProfile(auth0User)`
4. Edge function:
   - Creates/finds profile by email
   - Creates Supabase auth user
   - Returns verification token
5. Client verifies token with `supabase.auth.verifyOtp()`
6. **Supabase session created** ✅
7. User object:
   ```typescript
   {
     id: profileId,           // UUID from profiles table
     email: "user@example.com",
     authProvider: "supabase", // Has Supabase session!
     supabaseUser: {...},      // Full Supabase user object
     auth0User: {...}          // Original Auth0 data
   }
   ```

### Existing User Flow (Supabase)

1. User already has Supabase account
2. Logs in with Auth0 using **same email**
3. Edge function **links** Auth0 ID to existing profile
4. User sees **all their existing workspaces** ✅

---

## 🧪 Testing Steps

### Test 1: New Auth0 User
1. Go to `https://echo.analyzthis.ai/login`
2. Click **"Google"**
3. Sign in with a **new email** (not in system)
4. **Expected:**
   - ✅ Redirects to `/onboarding`
   - ✅ Can create workspace
   - ✅ No errors in console

### Test 2: Existing Supabase User via Auth0
1. Use an email that **already exists** in Supabase (e.g., `joshi.rishikesh@gmail.com`)
2. Click **"Google"** and sign in with that email
3. **Expected:**
   - ✅ Redirects to `/dashboard`
   - ✅ Sees **existing workspaces** in sidebar
   - ✅ Can access apps and data
   - ✅ Console logs: `✅ Auth0 user now has Supabase session`

### Test 3: Console Logs to Check
**Successful Flow:**
```
🔄 Creating Supabase session for Auth0 user...
✅ Profile and auth user created: [UUID]
✅ Supabase session created via token verification
✅ Auth0 user now has Supabase session
```

**If session creation fails:**
```
⚠️ Auth0 user without Supabase session (limited functionality)
```

---

## 🔐 Security Notes

### ✅ Secure Approach
- Profile creation uses `SECURITY DEFINER` function (bypasses RLS)
- Auth user creation uses admin API (server-side only)
- Verification tokens are single-use and expire
- No overly permissive `anon` policies

### ✅ RLS Policies
All existing RLS policies remain unchanged:
- `workspace_members`: Only authenticated users with `auth.uid()`
- `workspaces`: Owner-based access control
- `apps`: Workspace and collaborator-based access

Auth0 users now have `auth.uid()` via Supabase session, so they follow the same security model.

---

## 🚀 Deployment Checklist

### Before Deploy:
- [x] Build succeeds without errors
- [x] No linter errors
- [x] Edge function deployed to Supabase
- [x] Database migrations applied

### After Deploy:
1. Test with **new Auth0 user** (fresh email)
2. Test with **existing Supabase user via Auth0** (your email)
3. Check browser console for errors
4. Verify workspace data loads correctly

### Environment Variables Required:
```bash
VITE_SUPABASE_URL=https://evpskuhskpmrbbihdihd.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
VITE_AUTH0_DOMAIN=dev-4zhhwuuklw8sct06.us.auth0.com
VITE_AUTH0_CLIENT_ID=3D6O3DDUh0DCfDS9yDu7cqc0LZM11KxK
```

---

## 🎉 Expected Outcome

**Auth0 users now work exactly like Supabase users:**
- ✅ Have proper Supabase sessions
- ✅ Can access their workspaces
- ✅ All RLS policies work correctly
- ✅ Can create/update/delete data
- ✅ Extension can sync apps
- ✅ Comments and collaboration work

**Email-based profile linking:**
- ✅ Existing Supabase users can log in via Auth0
- ✅ See all their existing data
- ✅ Profile is linked by email (case-insensitive)

---

## 📝 What Changed vs Previous Approach

### Before (Broken):
```typescript
// Auth0 user without Supabase session
{
  id: profileId,
  authProvider: 'auth0', // No session
  // auth.uid() = null ❌
  // RLS policies block everything ❌
}
```

### After (Fixed):
```typescript
// Auth0 user WITH Supabase session
{
  id: profileId,
  authProvider: 'supabase', // Has session ✅
  supabaseUser: {...},
  // auth.uid() = user.id ✅
  // RLS policies work ✅
}
```

---

## 🐛 Troubleshooting

### Issue: "duplicate key value" error
**Cause:** User already has a workspace, but WorkspaceContext isn't loading it.

**Solution:** Check if Supabase session was created:
1. Open console
2. Look for: `✅ Supabase session created`
3. If not present, check edge function logs

### Issue: Can't see workspaces
**Cause:** RLS policies still blocking (session not created).

**Check:**
```javascript
// In browser console
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session); // Should not be null
```

### Issue: Edge function error
**Check Supabase Function Logs:**
1. Go to Supabase Dashboard → Edge Functions
2. Select `auth0-create-session`
3. Check Logs tab
4. Look for errors in profile or auth user creation

---

## 🎯 Summary

**The fix ensures Auth0 users get proper Supabase sessions, allowing them to access all their data securely through RLS policies, just like regular Supabase users.**

Your existing Supabase profile will be automatically linked when you log in with Auth0 using the same email address! 🎉

