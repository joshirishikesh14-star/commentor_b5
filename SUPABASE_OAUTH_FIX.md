# Fix OAuth Redirect URL Issue

## Problem
GitHub OAuth is redirecting to `localhost:3000` instead of your production domain `echo.analyzthis.ai`.

## Root Cause
Supabase needs to be configured with your production domain as the Site URL.

---

## ✅ Code Changes Applied

1. **Added VITE_APP_URL to `.env`**
   ```
   VITE_APP_URL=https://echo.analyzthis.ai
   ```

2. **Updated OAuth redirect logic in Login.tsx**
   - Now uses `VITE_APP_URL` instead of `window.location.origin`
   - Ensures redirects always go to production domain

3. **Updated OAuth redirect logic in Signup.tsx**
   - Same fix applied for signup flow

---

## 🔧 Required Supabase Configuration

### Step 1: Update Site URL in Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Update the **Site URL** to:
   ```
   https://echo.analyzthis.ai
   ```

### Step 2: Add Redirect URLs

In the same **URL Configuration** section, add these to **Redirect URLs**:

```
https://echo.analyzthis.ai/**
https://echo.analyzthis.ai/dashboard
https://echo.analyzthis.ai/onboarding
https://echo.analyzthis.ai/accept-invitation
```

**Note:** The wildcard `**` allows all paths under your domain.

### Step 3: Update OAuth Provider Settings (GitHub)

1. Go to [GitHub OAuth Apps](https://github.com/settings/developers)
2. Find your Echo OAuth app
3. Update **Authorization callback URL** to:
   ```
   https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback
   ```
   (Keep this as the Supabase callback URL - don't change it to your domain)

4. Update **Homepage URL** to:
   ```
   https://echo.analyzthis.ai
   ```

### Step 4: Update OAuth Provider Settings (Google)

If you're using Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth credentials
3. Update **Authorized JavaScript origins**:
   ```
   https://echo.analyzthis.ai
   ```

4. Keep **Authorized redirect URIs** as:
   ```
   https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback
   ```

---

## 🧪 Testing After Configuration

1. **Clear browser cache and cookies** for your domain
2. Go to `https://echo.analyzthis.ai/login`
3. Click **"Sign in with GitHub"**
4. Authorize on GitHub
5. You should be redirected to `https://echo.analyzthis.ai/dashboard`

---

## 📝 How OAuth Flow Works

```
User clicks "Sign in with GitHub"
    ↓
Supabase redirects to GitHub with callback URL:
  https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback
    ↓
User authorizes on GitHub
    ↓
GitHub redirects back to Supabase callback
    ↓
Supabase processes auth and redirects to YOUR Site URL:
  https://echo.analyzthis.ai/dashboard (from redirectTo parameter)
    ↓
User is logged in on your domain
```

---

## 🚨 Important Notes

### Site URL vs Redirect URLs
- **Site URL**: The main domain of your app (set in Supabase)
- **Redirect URLs**: Allowed paths where users can be redirected after auth
- **OAuth Callback URL**: Always points to Supabase (not your domain)

### Local Development
For local development, you can temporarily:
1. Set `VITE_APP_URL=http://localhost:5173` in `.env.local`
2. Add `http://localhost:5173/**` to Supabase Redirect URLs
3. Remember to switch back for production

### Security
- Never expose tokens in URLs (Supabase handles this automatically)
- The hash fragment `#access_token=...` should only appear temporarily
- Supabase automatically exchanges it for secure cookies

---

## 🐛 Troubleshooting

### Still redirecting to localhost?
1. Check Supabase **Site URL** is set to `https://echo.analyzthis.ai`
2. Verify **Redirect URLs** include your domain
3. Clear browser cache completely
4. Try in incognito/private mode

### "Redirect URI mismatch" error?
- Verify GitHub OAuth app has correct callback URL
- Check Google OAuth has correct authorized URIs
- Ensure Supabase callback URL is correct

### OAuth works but goes to wrong page?
- Check the `redirectTo` parameter in code
- Verify your app routing is correct
- Check for typos in URLs

---

## ✅ Verification Checklist

After completing all steps:

- [ ] Supabase Site URL = `https://echo.analyzthis.ai`
- [ ] Supabase Redirect URLs include `https://echo.analyzthis.ai/**`
- [ ] GitHub OAuth callback = `https://evpskuhskpmrbbihdihd.supabase.co/auth/v1/callback`
- [ ] GitHub OAuth homepage = `https://echo.analyzthis.ai`
- [ ] `.env` has `VITE_APP_URL=https://echo.analyzthis.ai`
- [ ] Project rebuilt with `npm run build`
- [ ] Tested OAuth login flow end-to-end
- [ ] No access tokens visible in URL after redirect
- [ ] User successfully lands on dashboard after login

---

## 🎯 Expected Result

After these fixes:
1. User clicks GitHub OAuth button
2. Authorizes on GitHub
3. Redirects to `https://echo.analyzthis.ai/dashboard`
4. User is logged in successfully
5. No tokens in URL (handled by Supabase)
