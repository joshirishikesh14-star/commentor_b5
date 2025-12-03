# Complete Migration Guide: Supabase Auth → Auth0

This guide covers **completely replacing Supabase Auth with Auth0** as the authentication provider for Echo.

## 📋 Overview

### What Changes

| Component | Before (Supabase Auth) | After (Auth0) |
|-----------|------------------------|---------------|
| **Authentication** | `supabase.auth.signIn()` | `auth0.loginWithRedirect()` |
| **User ID** | `auth.users.id` (UUID) | Auth0 `sub` (string) |
| **Session** | Supabase session in localStorage | Auth0 tokens (access_token, id_token) |
| **RLS Policies** | `auth.uid()` | Custom function using Auth0 `sub` |
| **User Profile** | Auto-created via trigger | Manual sync from Auth0 |
| **Extension Auth** | Supabase REST API | Auth0 API or custom backend |

### What Stays the Same

✅ **Database:** Still Supabase PostgreSQL  
✅ **Data Structure:** Same tables (profiles, workspaces, apps, etc.)  
✅ **Business Logic:** Same workflows  
✅ **Frontend:** Same React components (just auth methods change)

---

## 🏗️ Architecture Changes

### Current Architecture (Supabase Auth)

```
User → Supabase Auth → auth.users table → Trigger → profiles table
                                    ↓
                            RLS uses auth.uid()
```

### New Architecture (Auth0)

```
User → Auth0 → Auth0 User Store → Webhook/Function → profiles table
                                    ↓
                            RLS uses custom function
```

---

## 📦 Step 1: Install Auth0 SDK

```bash
npm install @auth0/auth0-spa-js
```

---

## 🔧 Step 2: Create Auth0 Service

Create `src/lib/auth0.ts`:

```typescript
import createAuth0Client, { Auth0Client, User } from '@auth0/auth0-spa-js';

let auth0Client: Auth0Client | null = null;

const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN!,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID!,
  redirectUri: window.location.origin,
  audience: `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/`,
  scope: 'openid profile email',
  cacheLocation: 'localstorage' as const,
};

export async function getAuth0Client(): Promise<Auth0Client> {
  if (!auth0Client) {
    auth0Client = await createAuth0Client(auth0Config);
  }
  return auth0Client;
}

export async function loginWithRedirect() {
  const client = await getAuth0Client();
  await client.loginWithRedirect({
    redirect_uri: window.location.origin,
  });
}

export async function logout() {
  const client = await getAuth0Client();
  await client.logout({
    returnTo: window.location.origin,
  });
}

export async function getUser(): Promise<User | null> {
  const client = await getAuth0Client();
  return await client.getUser();
}

export async function isAuthenticated(): Promise<boolean> {
  const client = await getAuth0Client();
  return await client.isAuthenticated();
}

export async function getIdToken(): Promise<string | null> {
  const client = await getAuth0Client();
  return await client.getIdTokenClaims().then(claims => claims?.__raw || null);
}

export async function getAccessToken(): Promise<string | null> {
  const client = await getAuth0Client();
  try {
    return await client.getTokenSilently();
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}
```

---

## 🔄 Step 3: Replace AuthContext

Replace `src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@auth0/auth0-spa-js';
import { getAuth0Client, getUser, isAuthenticated, loginWithRedirect, logout } from '../lib/auth0';
import { supabase } from '../lib/supabase';
import { checkUserWorkspaces } from '../lib/workspaceHelpers';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const client = await getAuth0Client();
        
        // Handle Auth0 callback
        if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
          await client.handleRedirectCallback();
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const authenticated = await isAuthenticated();
        if (authenticated) {
          const auth0User = await getUser();
          if (auth0User) {
            setUser(auth0User);
            
            // Sync Auth0 user to Supabase profiles table
            await syncAuth0UserToProfile(auth0User);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const syncAuth0UserToProfile = async (auth0User: User) => {
    // Get or create profile in Supabase
    const auth0Id = auth0User.sub; // Auth0 user ID (e.g., "auth0|123456")
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (!existingProfile) {
      // Create new profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          auth0_id: auth0Id,
          email: auth0User.email,
          full_name: auth0User.name || auth0User.email?.split('@')[0] || 'User',
          avatar_url: auth0User.picture,
        });

      if (error) {
        console.error('Error creating profile:', error);
      }
    } else {
      // Update existing profile
      await supabase
        .from('profiles')
        .update({
          email: auth0User.email,
          full_name: auth0User.name || auth0User.email?.split('@')[0] || 'User',
          avatar_url: auth0User.picture,
        })
        .eq('auth0_id', auth0Id);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Auth0 doesn't have direct signup API in SPA SDK
    // Redirect to Auth0 signup page
    try {
      const client = await getAuth0Client();
      await client.loginWithRedirect({
        screen_hint: 'signup',
        redirect_uri: window.location.origin,
      });
      return { error: null };
    } catch (error: any) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    // Auth0 SPA SDK doesn't support password login directly
    // Use Auth0's passwordless or redirect to login
    try {
      await loginWithRedirect();
      return { error: null };
    } catch (error: any) {
      return { error: error as Error };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const client = await getAuth0Client();
    await client.loginWithRedirect({
      connection: provider, // Auth0 connection name
      redirect_uri: window.location.origin,
    });
  };

  const signOut = async () => {
    await logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## 🗄️ Step 4: Update Database Schema

### Add `auth0_id` Column to Profiles

```sql
-- Migration: add_auth0_id_to_profiles.sql
ALTER TABLE profiles 
ADD COLUMN auth0_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX idx_profiles_auth0_id ON profiles(auth0_id);

-- Migrate existing users (if any)
-- This would need to be done manually or via script
```

### Update RLS Policies

**Before (using `auth.uid()`):**
```sql
CREATE POLICY "Users can view workspaces" ON workspaces
FOR SELECT TO authenticated
USING (owner_id = auth.uid());
```

**After (using Auth0 ID):**
```sql
-- Create helper function to get current user's profile ID
CREATE OR REPLACE FUNCTION current_user_profile_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  auth0_sub TEXT;
  profile_uuid uuid;
BEGIN
  -- Get Auth0 sub from JWT token
  -- This requires setting JWT secret in Supabase
  auth0_sub := current_setting('request.jwt.claims', true)::json->>'sub';
  
  -- Find profile by auth0_id
  SELECT id INTO profile_uuid
  FROM profiles
  WHERE auth0_id = auth0_sub
  LIMIT 1;
  
  RETURN profile_uuid;
END;
$$;

-- Update RLS policies
CREATE POLICY "Users can view workspaces" ON workspaces
FOR SELECT TO authenticated
USING (owner_id = current_user_profile_id());
```

**Important:** This requires configuring Supabase to accept Auth0 JWT tokens!

---

## 🔐 Step 5: Configure Supabase to Accept Auth0 Tokens

### Option A: Use Supabase Edge Function as Proxy

Create `supabase/functions/auth0-proxy/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Get Auth0 token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
      });
    }

    const auth0Token = authHeader.replace('Bearer ', '');

    // Verify token with Auth0
    const auth0Response = await fetch(
      `https://${Deno.env.get('AUTH0_DOMAIN')}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${auth0Token}`,
        },
      }
    );

    if (!auth0Response.ok) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
      });
    }

    const auth0User = await auth0Response.json();

    // Get or create profile
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth0_id', auth0User.sub)
      .single();

    // Return profile ID for RLS
    return new Response(JSON.stringify({ profile_id: profile?.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
```

### Option B: Use Custom JWT Secret (Simpler)

1. **Get Auth0 JWT Secret:**
   - Auth0 Dashboard → Applications → Your App → Settings
   - Copy the **Signing Secret** or use your Auth0 domain's public key

2. **Configure Supabase:**
   - Supabase Dashboard → Settings → API
   - Add Auth0 JWT secret to JWT settings
   - Update JWT verification to accept Auth0 tokens

**Note:** This is complex and may require Supabase support.

---

## 🔄 Step 6: Update All Auth Calls

### Login Page (`src/pages/Login.tsx`)

```typescript
// Before
const { error } = await supabase.auth.signInWithPassword({ email, password });

// After
const { signInWithOAuth } = useAuth();
await signInWithOAuth('google'); // or 'github'
```

### Signup Page (`src/pages/Signup.tsx`)

```typescript
// Before
const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } });

// After
const { signUp } = useAuth();
await signUp(email, password, fullName); // Redirects to Auth0 signup
```

### Protected Routes

```typescript
// Before
const { user } = useAuth();
if (!user) navigate('/login');

// After (same!)
const { user } = useAuth();
if (!user) navigate('/login');
```

---

## 📱 Step 7: Update Extension Authentication

Replace `extension/popup.js` auth logic:

```javascript
// Before: Supabase REST API
const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// After: Auth0 API or Custom Backend
// Option 1: Use Auth0 SPA SDK in extension (complex)
// Option 2: Create custom backend endpoint that validates Auth0 tokens
// Option 3: Use Auth0's Management API with service account

// Recommended: Create a Supabase Edge Function that accepts Auth0 tokens
async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Call your backend that validates Auth0 credentials
  const response = await fetch('https://echo.analyzthis.ai/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const { token, user } = await response.json();
  
  // Store Auth0 token
  await chrome.storage.local.set({
    auth0Token: token,
    userId: user.sub, // Auth0 user ID
    userEmail: user.email
  });
}
```

---

## 🗃️ Step 8: Update Database Queries

### Before (using Supabase client with auth)

```typescript
const { data } = await supabase
  .from('workspaces')
  .select('*');
// RLS automatically filters by auth.uid()
```

### After (need to pass Auth0 token)

```typescript
// Get Auth0 token
const token = await getIdToken();

// Pass token to Supabase (if configured to accept Auth0 JWTs)
const { data } = await supabase
  .from('workspaces')
  .select('*')
  .headers({
    Authorization: `Bearer ${token}`
  });
```

**OR** use a backend proxy that converts Auth0 token to Supabase session.

---

## 🔒 Step 9: Update RLS Policies

All RLS policies need to change from `auth.uid()` to `current_user_profile_id()`:

```sql
-- Example: Workspaces policy
DROP POLICY IF EXISTS "Users can view workspaces" ON workspaces;

CREATE POLICY "Users can view workspaces" ON workspaces
FOR SELECT TO authenticated
USING (
  owner_id = current_user_profile_id()
  OR id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = current_user_profile_id()
  )
);

-- Repeat for all tables: apps, threads, comments, etc.
```

---

## 🧪 Step 10: Testing Checklist

- [ ] **Auth0 Setup:**
  - [ ] Application created
  - [ ] Callback URLs configured
  - [ ] Social connections enabled (Google, GitHub)

- [ ] **Database:**
  - [ ] `auth0_id` column added to profiles
  - [ ] Index created on `auth0_id`
  - [ ] RLS policies updated
  - [ ] `current_user_profile_id()` function works

- [ ] **Frontend:**
  - [ ] Auth0 SDK installed
  - [ ] AuthContext replaced
  - [ ] Login page updated
  - [ ] Signup page updated
  - [ ] Protected routes work
  - [ ] User profile syncs correctly

- [ ] **Extension:**
  - [ ] Extension auth updated
  - [ ] Token storage works
  - [ ] API calls include Auth0 token

- [ ] **Integration:**
  - [ ] Supabase accepts Auth0 tokens (or proxy works)
  - [ ] RLS policies enforce correctly
  - [ ] User can access their data
  - [ ] User cannot access others' data

---

## ⚠️ Challenges & Considerations

### 1. **RLS Policy Complexity**
- Supabase RLS relies heavily on `auth.uid()`
- Need custom function to map Auth0 ID → profile ID
- May need to disable RLS and use application-level checks

### 2. **Token Management**
- Auth0 tokens expire (need refresh logic)
- Supabase expects its own JWT format
- May need token exchange/proxy layer

### 3. **Extension Authentication**
- Chrome extensions can't easily use Auth0 SPA SDK
- Need custom backend endpoint
- Or use Auth0's Management API

### 4. **User Migration**
- Existing users need `auth0_id` populated
- Need migration script
- Handle users who don't migrate

### 5. **Cost**
- Auth0 free tier: 7,000 MAU
- Supabase Auth: Unlimited (included)
- Consider if Auth0 is worth the cost

---

## 💡 Alternative: Hybrid Approach

Instead of full migration, consider:

1. **Keep Supabase Auth** for email/password
2. **Add Auth0** for social logins only
3. **Sync both** to same `profiles` table
4. **Use `auth.uid()` for Supabase users**
5. **Use `auth0_id` for Auth0 users**

This gives you:
- ✅ Best of both worlds
- ✅ Less migration risk
- ✅ Gradual transition
- ✅ Users can choose

---

## 📊 Migration Effort Estimate

| Task | Time | Complexity |
|------|------|------------|
| Install Auth0 SDK | 5 min | ⭐ Easy |
| Create Auth0 service | 30 min | ⭐⭐ Medium |
| Replace AuthContext | 2 hours | ⭐⭐⭐ Hard |
| Update Login/Signup pages | 1 hour | ⭐⭐ Medium |
| Database schema changes | 1 hour | ⭐⭐ Medium |
| RLS policy updates | 4 hours | ⭐⭐⭐⭐ Very Hard |
| Extension auth update | 3 hours | ⭐⭐⭐ Hard |
| Testing & debugging | 8 hours | ⭐⭐⭐⭐ Very Hard |
| **Total** | **~20 hours** | **High Risk** |

---

## 🎯 Recommendation

**Consider staying with Supabase Auth** unless you specifically need:
- Advanced Auth0 features (MFA, passwordless, etc.)
- Centralized user management across multiple apps
- Enterprise SSO requirements
- Custom authentication flows

**If you do migrate:**
1. Start with a **hybrid approach** (both providers)
2. Migrate users gradually
3. Test thoroughly in staging
4. Have a rollback plan

---

## 🔗 Resources

- **Auth0 React SDK:** https://auth0.com/docs/quickstart/spa/react
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **Auth0 Management API:** https://auth0.com/docs/api/management/v2

---

*Last Updated: December 2, 2024*

