# OAuth Setup Guide for Echo

This guide covers setting up OAuth authentication for **Google** and **GitHub** providers.

## 📋 Prerequisites

- Supabase project created
- Production URL: `https://echo.analyzthis.ai`
- Admin access to Google Cloud Console (for Google OAuth)
- Admin access to GitHub (for GitHub OAuth)

---

## 🔵 Google OAuth Setup

### Step 1: Create OAuth Credentials in Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create a new one)

2. **Enable Google+ API**
   - Navigate to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

3. **Create OAuth 2.0 Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - If prompted, configure OAuth consent screen first:
     - **User Type:** External (or Internal if using Google Workspace)
     - **App name:** Echo - Universal Feedback Platform
     - **User support email:** info@analyzthis.ai
     - **Developer contact:** info@analyzthis.ai
     - **Scopes:** (default is fine)
     - **Test users:** (optional, add your email for testing)

4. **Configure OAuth Client**
   - **Application type:** Web application
   - **Name:** Echo Web App
   - **Authorized JavaScript origins:**
     ```
     https://echo.analyzthis.ai
     https://evpskuhskpmrbbihdihd.supabase.co
     ```
   - **Authorized redirect URIs:**
     ```
     https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback
     ```
   - Click **CREATE**

5. **Copy Credentials**
   - You'll see a popup with:
     - **Client ID:** `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
     - **Client Secret:** `GOCSPX-xxxxxxxxxxxxxxxxxxxxx`
   - **Save these!** You'll need them for Supabase

### Step 2: Configure Google OAuth in Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication → Providers**
   - Click **Google** provider

3. **Fill in the OAuth Form:**

   | Field | Value |
   |-------|-------|
   **Enable Google provider** | ✅ Toggle ON |
   **Client ID (for OAuth)** | `[Your Google Client ID]` |
   **Client Secret (for OAuth)** | `[Your Google Client Secret]` |
   **Redirect URL** | `https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback` (auto-filled) |

4. **Click "Save"**

### Step 3: Verify Google OAuth

1. Go to `https://echo.analyzthis.ai/login`
2. Click **"Sign in with Google"**
3. You should be redirected to Google sign-in
4. After signing in, you should be redirected back to Echo dashboard

---

## 🐙 GitHub OAuth Setup

### Step 1: Create OAuth App in GitHub

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/developers
   - Or: Your Profile → Settings → Developer settings → OAuth Apps

2. **Create New OAuth App**
   - Click **"New OAuth App"** (or **"Register a new application"**)

3. **Fill in Application Details:**

   | Field | Value |
   |-------|-------|
   **Application name** | `Echo - Universal Feedback Platform` |
   **Homepage URL** | `https://echo.analyzthis.ai` |
   **Application description** | `Universal feedback platform for web applications` |
   **Authorization callback URL** | `https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback` |

4. **Click "Register application"**

5. **Copy Credentials**
   - You'll see:
     - **Client ID:** `Iv1.xxxxxxxxxxxxxxxx`
     - **Client Secret:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (click "Generate a new client secret" if needed)
   - **Save these!**

### Step 2: Configure GitHub OAuth in Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication → Providers**
   - Click **GitHub** provider

3. **Fill in the OAuth Form:**

   | Field | Value |
   |-------|-------|
   **Enable GitHub provider** | ✅ Toggle ON |
   **Client ID (for OAuth)** | `[Your GitHub Client ID]` |
   **Client Secret (for OAuth)** | `[Your GitHub Client Secret]` |
   **Redirect URL** | `https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback` (auto-filled) |

4. **Click "Save"**

### Step 3: Verify GitHub OAuth

1. Go to `https://echo.analyzthis.ai/login`
2. Click **"Sign in with GitHub"**
3. You should be redirected to GitHub authorization
4. Click **"Authorize"**
5. You should be redirected back to Echo dashboard

---

## ⚙️ Supabase Configuration Checklist

### Site URL
- **Location:** Authentication → URL Configuration
- **Site URL:** `https://echo.analyzthis.ai`
- **Redirect URLs:** Add these:
  ```
  https://echo.analyzthis.ai/**
  https://echo.analyzthis.ai/dashboard
  https://echo.analyzthis.ai/onboarding
  https://echo.analyzthis.ai/accept-invitation
  https://echo.analyzthis.ai/auth/confirm
  https://echo.analyzthis.ai/reset-password
  ```

### Email Templates (Optional)
- **Location:** Authentication → Email Templates
- Customize welcome emails, password reset, etc.
- Use your branding colors and logo

---

## 🔐 Environment Variables

Make sure your `.env` file has:

```bash
# Production
VITE_APP_URL=https://echo.analyzthis.ai

# Supabase (already configured)
VITE_SUPABASE_URL=https://evpskuhskpmrbbihdihd.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**For Vercel deployment:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add `VITE_APP_URL` = `https://echo.analyzthis.ai`

---

## 🧪 Testing OAuth Flow

### Test Checklist

- [ ] **Google OAuth:**
  - [ ] Click "Sign in with Google" → Redirects to Google
  - [ ] Sign in → Redirects back to Echo
  - [ ] User is logged in and sees dashboard
  - [ ] User profile shows Google email/name

- [ ] **GitHub OAuth:**
  - [ ] Click "Sign in with GitHub" → Redirects to GitHub
  - [ ] Authorize → Redirects back to Echo
  - [ ] User is logged in and sees dashboard
  - [ ] User profile shows GitHub email/name

- [ ] **Error Handling:**
  - [ ] User cancels OAuth → Shows error message
  - [ ] Invalid credentials → Shows error message
  - [ ] Network error → Shows error message

---

## 🐛 Troubleshooting

### Issue: "redirect_uri_mismatch"

**Solution:**
- Check that redirect URI in OAuth provider matches Supabase callback URL exactly
- Google: `https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback`
- GitHub: `https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback`

### Issue: "OAuth redirects to localhost"

**Solution:**
- Check `VITE_APP_URL` is set to `https://echo.analyzthis.ai`
- Check Supabase Site URL is `https://echo.analyzthis.ai`
- Rebuild and redeploy to Vercel

### Issue: "Invalid client credentials"

**Solution:**
- Double-check Client ID and Client Secret are correct
- Make sure there are no extra spaces
- Regenerate secrets if needed

### Issue: "User not redirected after OAuth"

**Solution:**
- Check `AuthContext.tsx` handles hash fragments (`#access_token=...`)
- Check redirect URLs include `https://echo.analyzthis.ai/**`
- Check browser console for errors

---

## 📝 OAuth Form Summary

### Google OAuth Form Fields:

```
✅ Enable Google provider: ON
Client ID: [from Google Cloud Console]
Client Secret: [from Google Cloud Console]
Redirect URL: https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback
```

### GitHub OAuth Form Fields:

```
✅ Enable GitHub provider: ON
Client ID: [from GitHub OAuth App]
Client Secret: [from GitHub OAuth App]
Redirect URL: https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback
```

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/evpskuhskpmrbbihdihd
- **Google Cloud Console:** https://console.cloud.google.com/
- **GitHub OAuth Apps:** https://github.com/settings/developers
- **Echo Production:** https://echo.analyzthis.ai

---

## ✅ Final Checklist

- [ ] Google OAuth app created in Google Cloud Console
- [ ] Google Client ID and Secret copied
- [ ] Google OAuth configured in Supabase
- [ ] GitHub OAuth app created in GitHub
- [ ] GitHub Client ID and Secret copied
- [ ] GitHub OAuth configured in Supabase
- [ ] Supabase Site URL = `https://echo.analyzthis.ai`
- [ ] Supabase Redirect URLs include `https://echo.analyzthis.ai/**`
- [ ] `VITE_APP_URL` environment variable set
- [ ] Both OAuth providers tested and working

---

*Last Updated: December 2, 2024*

