# Auth0 Environment Variables Setup

## Quick Setup

Create a `.env` file in the project root with these values:

```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://evpskuhskpmrbbihdihd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2cHNrdWhza3BtcmJiaWhkaWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTk3MTQsImV4cCI6MjA3OTE5NTcxNH0.1TFjxV7csnWm6cZTFIoreeEctFF799fruxGJByyV1kQ
VITE_APP_URL=https://echo.analyzthis.ai

# Auth0 Configuration (Optional - app works without these)
VITE_AUTH0_DOMAIN=dev-4zhhwuuklw8sct06.us.auth0.com
VITE_AUTH0_CLIENT_ID=3D6O3DDUh0DCfDS9yDu7cqc0LZM11KxK
VITE_AUTH0_AUDIENCE=https://dev-4zhhwuuklw8sct06.us.auth0.com/api/v2/
```

## Your Auth0 Credentials

- **Domain:** `dev-4zhhwuuklw8sct06.us.auth0.com`
- **Client ID:** `3D6O3DDUh0DCfDS9yDu7cqc0LZM11KxK`
- **Client Secret:** `JyGptvRYQ94cxvuV_ic_PYXHSeEq13mmjcmuEjEr0qlaluXzVDceraQOioiQrqKy` (not needed for SPA)

> **Note:** The Client Secret is NOT needed for Single Page Applications. It's only used for server-side operations. The app only needs the Domain and Client ID.

## Next Steps

1. **Create `.env` file** in project root with the values above
2. **Restart dev server:** `npm run dev`
3. **Verify Auth0 buttons appear** on `/login` page (purple buttons)
4. **For Vercel:** Add these environment variables in Vercel Dashboard → Settings → Environment Variables

## Auth0 Application Settings

Make sure your Auth0 application has these callback URLs configured:

- `https://echo.analyzthis.ai`
- `http://localhost:5173` (for local development)

Go to: https://manage.auth0.com/ → Applications → Your App → Settings → Allowed Callback URLs

---

*Last Updated: December 2, 2024*

