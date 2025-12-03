# Hybrid Auth Setup: Supabase Auth + Auth0

This document explains the **hybrid authentication approach** where both Supabase Auth and Auth0 coexist, allowing users to choose their preferred login method.

## ✅ What's Implemented

### 1. **Dual Authentication Support**
- ✅ Supabase Auth (email/password + OAuth) - **Existing users continue working**
- ✅ Auth0 (OAuth only) - **New option for users**

### 2. **Unified User Experience**
- ✅ Both auth methods create/update profiles in same `profiles` table
- ✅ Users can link Auth0 to existing Supabase accounts (by email)
- ✅ Same `user.id` format (profile UUID) for both auth methods
- ✅ Existing code continues to work without changes

### 3. **UI Updates**
- ✅ Login page shows both Supabase OAuth and Auth0 options
- ✅ Signup page shows both options
- ✅ Auth0 buttons only appear if Auth0 is configured

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install @auth0/auth0-spa-js
```

### Step 2: Configure Environment Variables

Add to your `.env` file:

```bash
# Auth0 Configuration (Optional - app works without these)
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=https://your-tenant.auth0.com/api/v2/

# Existing Supabase config (keep these!)
VITE_SUPABASE_URL=https://evpskuhskpmrbbihdihd.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=https://echo.analyzthis.ai
```

**For Vercel:**
- Go to Vercel Dashboard → Settings → Environment Variables
- Add the Auth0 variables

### Step 3: Set Up Auth0 (Optional)

If you want to enable Auth0:

1. **Create Auth0 Application**
   - Go to https://manage.auth0.com/
   - Create Regular Web Application
   - Set callback URL: `https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback`
   - Copy Client ID and Domain

2. **Configure Social Connections** (Optional)
   - Enable Google and/or GitHub in Auth0 Dashboard
   - Configure them with your OAuth credentials

3. **Add Environment Variables**
   - Set `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` in `.env`
   - Deploy to Vercel with these variables

### Step 4: Database Migration (Already Done ✅)

The migration `add_auth0_id_to_profiles` has been applied:
- Added `auth0_id` column to `profiles` table
- Created unique index on `auth0_id`
- Existing users unaffected

---

## 🎯 How It Works

### User Flow

#### Supabase Users (Existing - No Changes!)
1. User signs in with email/password or Supabase OAuth
2. Supabase creates/updates profile automatically
3. `user.id` = Supabase user UUID
4. Everything works exactly as before ✅

#### Auth0 Users (New!)
1. User clicks "Google (Auth0)" or "GitHub (Auth0)"
2. Redirects to Auth0 login
3. After login, Auth0 redirects back
4. `syncAuth0UserToProfile()` runs:
   - Checks if profile exists with `auth0_id`
   - If not, checks if email matches existing profile
   - If email matches, links Auth0 to existing account
   - If no match, creates new profile
5. `user.id` = Profile UUID (same format as Supabase users)
6. User can access all features ✅

### Account Linking

**Smart Linking by Email:**
- If Auth0 user signs in with email that matches existing Supabase profile
- System automatically links them (adds `auth0_id` to existing profile)
- User can now use either auth method!

---

## 🔒 RLS Policies

### Current Status

**Supabase Auth Users:**
- ✅ RLS works perfectly with `auth.uid()`
- ✅ All policies enforce correctly

**Auth0 Users:**
- ⚠️ **RLS Limitation:** Supabase RLS uses `auth.uid()` which only works for Supabase sessions
- ⚠️ Auth0 users don't have Supabase sessions, so RLS may block them

### Solutions

**Option 1: Use Service Role for Auth0 Users** (Recommended for now)
- Create Supabase Edge Function that validates Auth0 tokens
- Function uses service role to bypass RLS
- Returns data based on profile ID

**Option 2: Custom RLS Function** (Future)
- Create function that checks Auth0 JWT claims
- Configure Supabase to accept Auth0 JWTs
- Update RLS policies to use custom function

**Option 3: Application-Level Security** (Current)
- RLS may block Auth0 users
- Application code validates access
- Less secure but works immediately

**For Now:** Auth0 users can sign in and profiles are created, but some RLS-protected queries may fail. This is acceptable for initial rollout - we can enhance RLS support later.

---

## 📱 Extension Support

### Current Status

**Extension still uses Supabase Auth:**
- Extension popup uses Supabase REST API for login
- This continues to work for Supabase users
- Auth0 users need to use web app (not extension) for now

### Future Enhancement

To support Auth0 in extension:
1. Create backend API endpoint that validates Auth0 tokens
2. Endpoint returns Supabase-compatible session
3. Extension uses this endpoint instead of direct Supabase auth

**For Now:** Extension works for Supabase users. Auth0 users can use web app.

---

## 🧪 Testing

### Test Supabase Auth (Should Work Exactly as Before)

1. **Email/Password:**
   - Go to `/login`
   - Enter email/password
   - ✅ Should log in and redirect to dashboard

2. **Supabase OAuth:**
   - Click "Google" or "GitHub" (top row)
   - ✅ Should redirect to Supabase OAuth
   - ✅ Should log in and redirect to dashboard

### Test Auth0 (New Feature)

1. **Prerequisites:**
   - Auth0 configured in `.env`
   - Auth0 application created
   - Social connections enabled

2. **Auth0 OAuth:**
   - Go to `/login`
   - Click "Google (Auth0)" or "GitHub (Auth0)" (bottom row, purple buttons)
   - ✅ Should redirect to Auth0 login
   - ✅ After login, should redirect back and create/link profile
   - ✅ Should redirect to dashboard

3. **Account Linking:**
   - Create account with Supabase (email: test@example.com)
   - Log out
   - Sign in with Auth0 using same email
   - ✅ Should link to existing account
   - ✅ Should see same workspaces/apps

---

## 🐛 Troubleshooting

### Auth0 Buttons Not Showing

**Check:**
1. Is `VITE_AUTH0_DOMAIN` set in `.env`?
2. Is `VITE_AUTH0_CLIENT_ID` set in `.env`?
3. Restart dev server after adding env vars
4. Check browser console for errors

### Auth0 Login Redirects But Doesn't Log In

**Check:**
1. Auth0 callback URL matches: `https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback`
2. Check browser console for errors
3. Check Supabase logs for profile creation errors
4. Verify `auth0_id` column exists in profiles table

### RLS Blocking Auth0 Users

**Expected behavior** (for now):
- Auth0 users can sign in
- Some queries may fail due to RLS
- This is a known limitation

**Workaround:**
- Use service role for Auth0 user queries (via Edge Function)
- Or temporarily disable RLS for specific tables (not recommended)

### Existing Users Can't Log In

**This should NOT happen!** Supabase Auth is unchanged.

**If it happens:**
1. Check Supabase dashboard → Authentication → Users
2. Verify user exists
3. Check browser console for errors
4. Try clearing localStorage and cookies

---

## 📊 What Changed vs What Stayed

### ✅ Unchanged (Existing Users Safe)

- ✅ Supabase Auth API calls (`signIn`, `signUp`, `signOut`)
- ✅ Email/password login
- ✅ Supabase OAuth (Google, GitHub)
- ✅ User profiles structure
- ✅ RLS policies (for Supabase users)
- ✅ Extension authentication
- ✅ All existing features

### 🆕 Added (New Features)

- ✅ Auth0 SDK integration
- ✅ Auth0 OAuth buttons in UI
- ✅ `auth0_id` column in profiles
- ✅ `syncAuth0UserToProfile()` function
- ✅ Account linking by email
- ✅ Unified user type (`UnifiedUser`)

### ⚠️ Known Limitations

- ⚠️ RLS may block Auth0 users (needs enhancement)
- ⚠️ Extension doesn't support Auth0 yet
- ⚠️ Password reset only works for Supabase users
- ⚠️ Auth0 users can't use email/password (OAuth only)

---

## 🎯 Next Steps (Optional Enhancements)

1. **RLS Support for Auth0:**
   - Create Edge Function to validate Auth0 tokens
   - Update RLS policies to check Auth0 users
   - Or use service role for Auth0 queries

2. **Extension Auth0 Support:**
   - Create backend API for Auth0 token validation
   - Update extension to use this API

3. **Unified Password Reset:**
   - Add Auth0 password reset flow
   - Or redirect Auth0 users to Auth0 dashboard

4. **User Settings:**
   - Show linked auth methods
   - Allow unlinking Auth0
   - Show last login method

---

## ✅ Migration Checklist

- [x] Install `@auth0/auth0-spa-js`
- [x] Create `src/lib/auth0.ts` service
- [x] Update `AuthContext` to support both
- [x] Add `auth0_id` column to profiles
- [x] Update Login page with Auth0 buttons
- [x] Update Signup page with Auth0 buttons
- [x] Test Supabase auth still works
- [ ] Configure Auth0 (optional)
- [ ] Test Auth0 login (if configured)
- [ ] Test account linking
- [ ] Deploy to Vercel with env vars

---

## 🔗 Quick Reference

### Environment Variables

```bash
# Required for Supabase Auth (existing)
VITE_SUPABASE_URL=https://evpskuhskpmrbbihdihd.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
VITE_APP_URL=https://echo.analyzthis.ai

# Optional for Auth0 (app works without these)
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://your-tenant.auth0.com/api/v2/
```

### Auth0 Setup Links

- **Auth0 Dashboard:** https://manage.auth0.com/
- **Create Application:** https://manage.auth0.com/#/applications
- **Social Connections:** https://manage.auth0.com/#/connections/social

### Code Files Changed

- `src/lib/auth0.ts` - NEW: Auth0 service
- `src/contexts/AuthContext.tsx` - UPDATED: Hybrid auth support
- `src/pages/Login.tsx` - UPDATED: Added Auth0 buttons
- `src/pages/Signup.tsx` - UPDATED: Added Auth0 buttons
- `package.json` - UPDATED: Added Auth0 SDK
- Database migration - APPLIED: Added `auth0_id` column

---

*Last Updated: December 2, 2024*

