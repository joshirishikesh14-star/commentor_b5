# OAuth Setup Guide

Complete guide for setting up OAuth authentication with Google and GitHub in your Supabase project.

---

## ✅ What's Already Implemented

The codebase now includes:
- ✅ OAuth login buttons on Login page (Google & GitHub)
- ✅ OAuth signup buttons on Signup page (Google & GitHub)
- ✅ Proper redirect handling for invitation flows
- ✅ Email invitation system with SMTP configured

---

## 🔧 Supabase Configuration Required

You need to configure OAuth providers in your Supabase Dashboard to enable social login.

### 1. Google OAuth Setup

#### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if prompted:
   - App name: Your app name
   - User support email: Your email
   - Developer contact: Your email
6. For Application type, select **Web application**
7. Add authorized redirect URIs:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Replace `<your-project-ref>` with your Supabase project reference

8. Click **Create** and save:
   - **Client ID**
   - **Client Secret**

#### Step 2: Configure in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click to expand
5. Enable Google provider
6. Paste your:
   - Client ID
   - Client Secret
7. Click **Save**

---

### 2. GitHub OAuth Setup

#### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in details:
   - **Application name**: Your app name
   - **Homepage URL**: Your app URL (e.g., `http://localhost:5173` for dev)
   - **Authorization callback URL**:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Save the **Client ID**
6. Click **Generate a new client secret** and save the **Client Secret**

#### Step 2: Configure in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **GitHub** and click to expand
5. Enable GitHub provider
6. Paste your:
   - Client ID
   - Client Secret
7. Click **Save**

---

## 🔄 How OAuth Works in Your App

### Login Flow
```
User clicks "Sign in with Google/GitHub"
    ↓
Supabase redirects to OAuth provider
    ↓
User authorizes on provider's site
    ↓
Provider redirects back to Supabase callback
    ↓
Supabase creates/updates user account
    ↓
User redirected to dashboard or specified redirect URL
```

### Invitation Acceptance Flow
```
User receives email invitation
    ↓
Clicks "Accept Invitation" link
    ↓
Redirected to /accept-invitation?token=xyz
    ↓
If not logged in → Redirects to /login?redirect=/accept-invitation?token=xyz
    ↓
User can login with email/password OR OAuth
    ↓
After login → Automatically redirected back to accept invitation
    ↓
Invitation processed → User gets app access
```

---

## 🧪 Testing OAuth

### Test Google OAuth:
1. Make sure you've configured Google OAuth in Supabase
2. Go to `/login` or `/signup`
3. Click **"Sign in with Google"** or **"Sign up with Google"**
4. Authorize on Google's consent screen
5. You should be redirected back and logged in

### Test GitHub OAuth:
1. Make sure you've configured GitHub OAuth in Supabase
2. Go to `/login` or `/signup`
3. Click **"Sign in with GitHub"** or **"Sign up with GitHub"**
4. Authorize on GitHub
5. You should be redirected back and logged in

### Test OAuth with Invitations:
1. Send an invitation to a test email
2. Click the invitation link (not logged in)
3. You'll be redirected to login
4. Click **"Sign in with Google"** or **"Sign in with GitHub"**
5. After OAuth login, you should be automatically redirected to accept the invitation
6. Invitation is processed and you get app access

---

## 🔐 Security Notes

### Redirect URLs
- **Production**: Update OAuth apps with your production domain
  ```
  https://<your-project-ref>.supabase.co/auth/v1/callback
  ```
- **Development**: You can add localhost for testing
  ```
  http://localhost:5173/auth/v1/callback
  ```
  (But Supabase handles the callback, so use Supabase URL)

### User Metadata
When users sign up with OAuth:
- `user.email` is populated from OAuth provider
- `user.user_metadata.full_name` may be populated (depends on provider)
- `user.user_metadata.avatar_url` may be populated (profile picture)

### Profile Creation
The `profiles` table is automatically populated via database trigger when:
- User signs up with email/password
- User signs up with OAuth

---

## 📧 Email vs OAuth Users

| Feature | Email/Password | OAuth (Google/GitHub) |
|---------|---------------|----------------------|
| Signup | Manual email confirmation | Instant (no confirmation) |
| Password | Required | Not needed |
| Profile picture | Manual upload | Auto from provider |
| Email verification | Required | Pre-verified by provider |
| Password reset | Via email | Not applicable |

---

## 🐛 Troubleshooting

### "Error: invalid_request"
- Check that OAuth credentials are correctly configured in Supabase
- Verify redirect URLs match exactly (including protocol)
- Make sure OAuth app is not in testing mode (Google)

### "Redirect URI mismatch"
- The redirect URI in your OAuth app must be:
  ```
  https://<your-project-ref>.supabase.co/auth/v1/callback
  ```
- Update it in both Google Cloud Console and GitHub OAuth settings

### User logged in but invitation not accepted
- Check browser console for errors
- Verify `accept_app_invitation()` function exists in database
- Check that `app_invitations` table has the token

### OAuth button doesn't work
1. Open browser console (F12)
2. Click the OAuth button
3. Check for errors
4. Verify Supabase project settings
5. Ensure OAuth provider is enabled in Supabase Dashboard

---

## 🎯 Next Steps

After configuring OAuth:

1. ✅ Test login with Google
2. ✅ Test login with GitHub
3. ✅ Test signup with OAuth
4. ✅ Send test invitation and accept using OAuth
5. ✅ Verify user profile is created correctly
6. ✅ Check that invited users get proper app access

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-github)
- [OAuth Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
