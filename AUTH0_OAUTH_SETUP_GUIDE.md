# Auth0 OAuth Setup Guide for Echo

This guide covers setting up **Auth0** as an optional OAuth provider for Echo. Auth0 works alongside Supabase Auth in a **hybrid approach** - existing Supabase users continue working, and Auth0 is available as an additional option.

> **📖 See Also:** 
> - For complete hybrid auth setup details, see [`HYBRID_AUTH_SETUP.md`](./HYBRID_AUTH_SETUP.md)
> - For quick environment variables setup, see [`AUTH0_ENV_SETUP.md`](./AUTH0_ENV_SETUP.md)

## ⚡ Quick Setup (Your Credentials)

**Your Auth0 Credentials:**
- **Domain:** `dev-4zhhwuuklw8sct06.us.auth0.com`
- **Client ID:** `3D6O3DDUh0DCfDS9yDu7cqc0LZM11KxK`

**Quick Steps:**
1. Create `.env` file with your Auth0 credentials (see [`AUTH0_ENV_SETUP.md`](./AUTH0_ENV_SETUP.md))
2. Configure Auth0 callback URLs (see Step 1 below)
3. Enable social connections (Google/GitHub) in Auth0
4. Restart dev server: `npm run dev`
5. Test on `/login` page - purple Auth0 buttons should appear

## 🎯 Overview

**Hybrid Authentication Approach:**
- ✅ **Supabase Auth** - Email/password + Supabase OAuth (Google/GitHub) - **Existing users unaffected**
- ✅ **Auth0** - OAuth only (Google/GitHub via Auth0) - **New optional option**
- ✅ **Unified Profiles** - Both auth methods sync to same `profiles` table
- ✅ **Account Linking** - Auth0 can link to existing Supabase accounts by email

---

## 📋 Prerequisites

- Auth0 account (free tier available at https://auth0.com)
- Echo codebase with hybrid auth already implemented
- Production URL: `https://echo.analyzthis.ai`

---

## 🔐 Auth0 Setup

### Step 1: Create Auth0 Application

1. **Log in to Auth0 Dashboard**
   - Visit: https://manage.auth0.com/
   - Sign in or create a free account

2. **Create New Application**
   - Go to **Applications** → **Applications**
   - Click **+ Create Application**
   - **Name:** `Echo - Universal Feedback Platform`
   - **Application Type:** Select **Single Page Application** (SPA)
   - Click **Create**

   > **Note:** We use SPA type because Auth0 SDK handles the OAuth flow client-side.

3. **Configure Application Settings**

   After creation, you'll see the application settings. Configure:

   | Field | Value |
   |-------|-------|
   **Application Name** | `Echo - Universal Feedback Platform` |
   **Application Logo** | (Optional) Upload Echo logo |
   **Allowed Callback URLs** | `https://echo.analyzthis.ai`<br>`http://localhost:5173` (for local dev) |
   **Allowed Logout URLs** | `https://echo.analyzthis.ai`<br>`http://localhost:5173` (for local dev) |
   **Allowed Web Origins** | `https://echo.analyzthis.ai`<br>`http://localhost:5173` (for local dev) |
   **Allowed Origins (CORS)** | `https://echo.analyzthis.ai`<br>`http://localhost:5173` (for local dev) |

   **Important:** Add these URLs (one per line):
   ```
   https://echo.analyzthis.ai
   http://localhost:5173
   ```

   > **Your Auth0 Domain:** `dev-4zhhwuuklw8sct06.us.auth0.com`
   > **Your Client ID:** `3D6O3DDUh0DCfDS9yDu7cqc0LZM11KxK`

4. **Save Settings**
   - Scroll down and click **Save Changes**

### Step 2: Get Auth0 Credentials

1. **Copy Application Credentials**
   - In the application settings, you'll see:
     - **Domain:** `your-tenant.auth0.com` (e.g., `echo-dev.us.auth0.com`)
     - **Client ID:** `xxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Save these!** You'll need them for environment variables

   > **Note:** For SPA applications, Auth0 doesn't use Client Secret (it's public).

2. **Note Your Auth0 Domain**
   - Format: `[tenant-name].[region].auth0.com`
   - **Your Domain:** `dev-4zhhwuuklw8sct06.us.auth0.com`
   - This is different from your custom domain (if you have one)

### Step 3: Configure Social Connections (Required for OAuth)

1. **Enable Google Connection**
   - Go to **Authentication** → **Social**
   - Click **+ Create Connection**
   - Select **Google**
   - Configure:
     - **Client ID:** Your Google OAuth Client ID
     - **Client Secret:** Your Google OAuth Client Secret
   - Click **Save**

2. **Enable GitHub Connection**
   - Go to **Authentication** → **Social**
   - Click **+ Create Connection**
   - Select **GitHub**
   - Configure:
     - **Client ID:** Your GitHub OAuth App Client ID
     - **Client Secret:** Your GitHub OAuth App Client Secret
   - Click **Save**

   > **Need Google/GitHub OAuth credentials?** See Auth0's guides:
   - [Google Setup](https://auth0.com/docs/authenticate/identity-providers/social-identity-providers/google)
   - [GitHub Setup](https://auth0.com/docs/authenticate/identity-providers/social-identity-providers/github)

3. **Set Up Custom Domain** (Optional - for production)
   - Go to **Branding** → **Custom Domains**
   - Add your custom domain: `auth.echo.analyzthis.ai`
   - Follow DNS configuration steps
   - **Note:** This requires DNS access to your domain

---

## 🔧 Code Integration (Already Implemented ✅)

The hybrid auth system is already implemented in the codebase. Here's what's included:

### Files Created/Updated:

1. **`src/lib/auth0.ts`** - Auth0 SDK service
   - Handles Auth0 client initialization
   - Provides login/logout functions
   - Manages Auth0 callbacks

2. **`src/contexts/AuthContext.tsx`** - Updated for hybrid auth
   - Supports both Supabase and Auth0 users
   - Unified user type (`UnifiedUser`)
   - Auto-syncs Auth0 users to profiles table

3. **`src/pages/Login.tsx`** - Updated with Auth0 buttons
   - Shows Supabase OAuth buttons (top row)
   - Shows Auth0 OAuth buttons (bottom row, purple) - only if configured

4. **`src/pages/Signup.tsx`** - Updated with Auth0 buttons
   - Same layout as Login page

5. **Database Migration** - `add_auth0_id_to_profiles`
   - Added `auth0_id` column to `profiles` table
   - Allows linking Auth0 accounts to existing profiles

### How It Works:

1. **Auth0 Login Flow:**
   ```
   User clicks "Google (Auth0)" 
   → Redirects to Auth0 login page
   → User signs in with Google/GitHub
   → Auth0 redirects back to Echo
   → AuthContext handles callback
   → syncAuth0UserToProfile() creates/updates profile
   → User logged in with UnifiedUser
   ```

2. **Account Linking:**
   - If Auth0 user signs in with email matching existing Supabase account
   - System automatically links them (adds `auth0_id` to existing profile)
   - User can now use either auth method!

---

## 🔑 Environment Variables

Add to your `.env` file:

```bash
# Auth0 Configuration (Optional - app works without these)
VITE_AUTH0_DOMAIN=dev-4zhhwuuklw8sct06.us.auth0.com
VITE_AUTH0_CLIENT_ID=3D6O3DDUh0DCfDS9yDu7cqc0LZM11KxK
VITE_AUTH0_AUDIENCE=https://dev-4zhhwuuklw8sct06.us.auth0.com/api/v2/

# Supabase (existing - required)
VITE_SUPABASE_URL=https://evpskuhskpmrbbihdihd.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=https://echo.analyzthis.ai
```

> **🔒 Security Note:** The Client Secret is not needed for SPA applications. Only the Domain and Client ID are required.

**For Vercel:**
- Go to Vercel Dashboard → Settings → Environment Variables
- Add these variables:
  - `VITE_AUTH0_DOMAIN=dev-4zhhwuuklw8sct06.us.auth0.com`
  - `VITE_AUTH0_CLIENT_ID=3D6O3DDUh0DCfDS9yDu7cqc0LZM11KxK`
  - `VITE_AUTH0_AUDIENCE=https://dev-4zhhwuuklw8sct06.us.auth0.com/api/v2/`
- Redeploy after adding variables

**For Local Development:**
- Create `.env` file in project root (copy from `.env.example`)
- Add the Auth0 variables above
- Restart dev server: `npm run dev`

---

## 🧪 Testing Auth0 OAuth

### Test Checklist

- [ ] **Auth0 Application Created:**
  - [ ] Application type: Single Page Application (SPA)
  - [ ] Callback URLs configured (production + localhost)
  - [ ] Client ID copied

- [ ] **Social Connections Configured:**
  - [ ] Google connection enabled and configured
  - [ ] GitHub connection enabled and configured

- [ ] **Environment Variables Set:**
  - [ ] `VITE_AUTH0_DOMAIN` set
  - [ ] `VITE_AUTH0_CLIENT_ID` set
  - [ ] `VITE_AUTH0_AUDIENCE` set (optional)

- [ ] **Code Ready:**
  - [ ] Dependencies installed: `npm install`
  - [ ] Auth0 SDK installed: `@auth0/auth0-spa-js`

- [ ] **OAuth Flow:**
  - [ ] Go to `/login` page
  - [ ] See purple "Google (Auth0)" and "GitHub (Auth0)" buttons
  - [ ] Click "Google (Auth0)" → Redirects to Auth0
  - [ ] Sign in → Redirects back to Echo
  - [ ] User is logged in and sees dashboard
  - [ ] User profile shows Auth0 email/name

- [ ] **Account Linking Test:**
  - [ ] Create account with Supabase (email: test@example.com)
  - [ ] Log out
  - [ ] Sign in with Auth0 using same email
  - [ ] Should link to existing account
  - [ ] Should see same workspaces/apps

- [ ] **Error Handling:**
  - [ ] User cancels → Shows error message
  - [ ] Invalid credentials → Shows error message

---

## 🐛 Troubleshooting

### Issue: Auth0 Buttons Not Showing

**Solution:**
- Check `VITE_AUTH0_DOMAIN` is set in `.env`
- Check `VITE_AUTH0_CLIENT_ID` is set in `.env`
- Restart dev server after adding env vars
- Check browser console for errors
- Verify Auth0 client initializes: `getAuth0Client()` should return client, not null

### Issue: "redirect_uri_mismatch"

**Solution:**
- Check Auth0 **Allowed Callback URLs** includes:
  ```
  https://echo.analyzthis.ai
  http://localhost:5173
  ```
- Make sure there are no trailing slashes or typos
- For production, ensure Vercel URL matches exactly

### Issue: "Invalid client credentials"

**Solution:**
- Double-check Client ID in `.env` matches Auth0 Application
- Verify Client ID is from the correct Auth0 application
- Make sure you're using SPA application type (not Regular Web App)

### Issue: "Social connection not configured"

**Solution:**
- Go to Auth0 Dashboard → Authentication → Social
- Ensure Google and/or GitHub connections are enabled
- Verify OAuth credentials are correct
- Test connection in Auth0 dashboard first

### Issue: "User not syncing to profiles"

**Solution:**
- Check browser console for errors
- Verify `auth0_id` column exists in `profiles` table
- Check Supabase logs for insert/update errors
- Verify database migration was applied

### Issue: "RLS blocking Auth0 users"

**Expected behavior** (for now):
- Auth0 users can sign in
- Some queries may fail due to RLS
- This is a known limitation (see `HYBRID_AUTH_SETUP.md`)

**Workaround:**
- Use service role for Auth0 user queries (via Edge Function)
- Or temporarily adjust RLS policies (not recommended for production)

---

## 🎨 Auth0 Branding (Optional)

### Customize Auth0 Login Page

1. **Go to Auth0 Dashboard** → **Branding** → **Universal Login**
2. **Customize:**
   - Upload Echo logo
   - Change colors to match Echo branding
   - Customize login text
   - Add custom CSS

### Custom Domain (Production)

1. **Go to Branding** → **Custom Domains**
2. **Add Domain:** `auth.echo.analyzthis.ai`
3. **Configure DNS:**
   - Add CNAME record pointing to Auth0
   - Wait for SSL certificate (can take 24 hours)
4. **Update Environment Variable:**
   - Change `VITE_AUTH0_DOMAIN` to `auth.echo.analyzthis.ai`
   - Redeploy

---

## 🔗 Quick Links

- **Auth0 Dashboard:** https://manage.auth0.com/
- **Auth0 Applications:** https://manage.auth0.com/#/applications
- **Auth0 Social Connections:** https://manage.auth0.com/#/connections/social
- **Auth0 Documentation:** https://auth0.com/docs
- **Supabase Dashboard:** https://supabase.com/dashboard/project/evpskuhskpmrbbihdihd
- **Echo Production:** https://echo.analyzthis.ai
- **Hybrid Auth Guide:** [`HYBRID_AUTH_SETUP.md`](./HYBRID_AUTH_SETUP.md)

---

## 📚 Additional Resources

- **Auth0 Quick Start (SPA):** https://auth0.com/docs/quickstart/spa/react
- **Auth0 OAuth 2.0:** https://auth0.com/docs/protocols/oauth
- **Auth0 Social Connections:** https://auth0.com/docs/authenticate/identity-providers/social-identity-providers
- **Google OAuth Setup:** https://auth0.com/docs/authenticate/identity-providers/social-identity-providers/google
- **GitHub OAuth Setup:** https://auth0.com/docs/authenticate/identity-providers/social-identity-providers/github

---

## ✅ Final Checklist

- [ ] Auth0 account created
- [ ] Auth0 Application created (Single Page Application)
- [ ] Callback URLs configured: `https://echo.analyzthis.ai` and `http://localhost:5173`
- [ ] Client ID copied
- [ ] Google connection enabled and configured
- [ ] GitHub connection enabled and configured
- [ ] Environment variables set (`VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`)
- [ ] Dependencies installed (`npm install`)
- [ ] Database migration applied (`auth0_id` column exists)
- [ ] Auth0 buttons appear on login/signup pages
- [ ] OAuth flow tested and working
- [ ] Account linking tested
- [ ] Error handling tested
- [ ] Deployed to Vercel with env vars

---

## 💡 Auth0 vs Supabase OAuth

### When to Use Auth0:

✅ **Use Auth0 if:**
- You want advanced features (MFA, passwordless, etc.)
- You need custom login flows
- You want centralized user management
- You need analytics on authentication
- You want more control over OAuth providers

### When to Use Supabase OAuth:

✅ **Use Supabase OAuth if:**
- You want simpler setup
- You prefer Supabase's built-in auth
- You want fewer dependencies
- You're already using Supabase Auth

### Hybrid Approach Benefits:

✅ **Best of Both Worlds:**
- Existing users continue using Supabase Auth (no disruption)
- New users can choose Auth0 if preferred
- Account linking allows users to use either method
- Unified profiles table for both auth methods

### Comparison:

| Feature | Supabase OAuth | Auth0 |
|---------|---------------|-------|
| Setup Complexity | ⭐⭐ Simple | ⭐⭐⭐ Moderate |
| Features | Basic OAuth | Advanced (MFA, etc.) |
| Cost | Free | Free tier available |
| User Management | Supabase Dashboard | Auth0 Dashboard |
| Customization | Limited | Extensive |
| Account Linking | No | Yes (with Supabase) |

---

## 🚨 Important Notes

1. **Auth0 is Optional:**
   - App works perfectly without Auth0 configured
   - Auth0 buttons only appear if env vars are set
   - Existing Supabase users unaffected

2. **RLS Limitations:**
   - Auth0 users may be blocked by RLS policies
   - This is a known limitation (see `HYBRID_AUTH_SETUP.md`)
   - Enhancement planned for future

3. **Extension Support:**
   - Extension currently uses Supabase Auth only
   - Auth0 users can use web app
   - Extension Auth0 support planned for future

4. **Password Reset:**
   - Only works for Supabase users
   - Auth0 users need to use Auth0 dashboard
   - Unified password reset planned for future

---

*Last Updated: December 2, 2024*
