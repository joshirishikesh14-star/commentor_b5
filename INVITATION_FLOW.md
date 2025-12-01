# Invitation & Access Management System

## Overview
Complete documentation of how users are invited and managed across workspace and app levels.

---

## 🎯 Two Access Methods

### 1. **App-Level Email Invitations** (Direct User Access)
### 2. **Share Links with Tokens** (Public/Anonymous Access)

---

## 📧 App-Level Email Invitations

### Flow Diagram
```
App Owner → Clicks "Invite" → Enters Email + Access Level
    ↓
Creates app_invitations record (status: 'pending')
    ↓
Edge function sends email via Supabase Auth
    ↓
Recipient clicks "Accept Invitation" link
    ↓
AcceptInvitation page → calls accept_app_invitation()
    ↓
Creates app_collaborators record (user now has app access)
    ↓
If inviter is workspace owner → Also adds to workspace_members
    ↓
Updates invitation status to 'accepted'
    ↓
Redirects to /review/{appId}
```

### Database Tables Involved

**app_invitations**
```sql
- id (uuid, PK)
- app_id (FK to apps)
- inviter_id (FK to profiles)
- invitee_email (email address)
- invitee_id (FK to profiles, set on acceptance)
- access_level (viewer/commenter/moderator)
- status (pending/accepted/declined/expired)
- invitation_token (unique token for acceptance)
- expires_at (7 days by default)
```

**app_collaborators**
```sql
- id (uuid, PK)
- app_id (FK to apps)
- user_id (FK to profiles)
- access_level (viewer/commenter/moderator/admin)
- invited_by (FK to profiles)
- invitation_id (FK to app_invitations)
```

### Integration with Workspace

**Key Logic in `accept_app_invitation()` function:**

```sql
-- Always creates app_collaborators record
INSERT INTO app_collaborators (app_id, user_id, access_level, ...)

-- Conditional: If inviter is workspace owner
IF inviter_id = workspace.owner_id THEN
  INSERT INTO workspace_members (workspace_id, user_id, role, ...)
END IF
```

**This means:**
- ✅ Workspace owners who invite users → User gets **both** app access **and** workspace membership
- ✅ Regular app collaborators who invite → User gets **only** app access
- ✅ Users invited to workspace directly → Have access to **all apps** in that workspace

### Access Levels Mapping

| App Access Level | Workspace Role (if applicable) |
|-----------------|-------------------------------|
| viewer          | viewer                        |
| commenter       | commenter                     |
| moderator       | moderator                     |

---

## 🔗 Share Links (Token-Based Access)

### Flow Diagram
```
App Owner → Clicks "Share URL" → System generates token
    ↓
Creates/retrieves app_access_tokens record
    ↓
User gets shareable link: /review/{appId}?token={token}
    ↓
Anyone with link can access (no login required initially)
    ↓
PublicReview component validates token
    ↓
If valid & active → Grants access to review interface
```

### Database Table

**app_access_tokens**
```sql
- id (uuid, PK)
- app_id (FK to apps)
- token (unique, base64 encoded)
- access_level (reviewer/commenter/editor)
- expires_at (optional expiration)
- created_by (FK to profiles)
- is_active (boolean, can be deactivated)
```

### Token Validation Logic

```typescript
// In PublicReview.tsx
1. Check if URL has ?token= parameter
2. If yes:
   - Query app_access_tokens table
   - Verify token is valid, active, not expired
   - Grant access without authentication
3. If no token:
   - Require user login
   - Check via has_app_access() function
```

### Share Link Users are NOT in Workspace

**Important:** Users accessing via share link:
- ❌ Are **NOT** added to workspace_members
- ❌ Are **NOT** added to app_collaborators
- ✅ Have **temporary** access via token only
- ✅ Can be **converted** to full collaborator if they sign up and get invited

---

## 🔐 Access Control Summary

### Who has access to an app?

The `has_app_access(app_id, user_id)` function checks:

```sql
1. App owner (apps.owner_id = user_id)
2. Explicit collaborator (app_collaborators.user_id = user_id)
3. Workspace owner (workspace.owner_id = user_id)
```

**Note:** Share token users are checked separately in the frontend before calling RLS policies.

### Workspace Members vs App Collaborators

| Scenario | workspace_members | app_collaborators | Access |
|----------|------------------|-------------------|--------|
| Workspace owner invites to app | ✅ Yes | ✅ Yes | Full access to workspace + app |
| App collaborator invites | ❌ No | ✅ Yes | Only this specific app |
| Share link access | ❌ No | ❌ No | Temporary via token only |
| Workspace member added directly | ✅ Yes | ❌ No | All apps in workspace |

---

## 🎬 Complete User Journey Examples

### Example 1: Workspace Owner Invites Tester
1. Alice owns "Marketing Workspace"
2. Alice creates "Product Website" app
3. Alice clicks "Invite" on app → enters bob@test.com
4. Bob receives email → clicks "Accept Invitation"
5. **Result:** Bob is added to:
   - ✅ workspace_members (Marketing Workspace)
   - ✅ app_collaborators (Product Website)
   - Can access **all apps** in Marketing Workspace

### Example 2: App Collaborator Invites Reviewer
1. Bob is collaborator on "Product Website" (but not workspace member)
2. Bob clicks "Invite" → enters charlie@test.com
3. Charlie accepts invitation
4. **Result:** Charlie is added to:
   - ❌ workspace_members (NO workspace access)
   - ✅ app_collaborators (Product Website only)
   - Can access **only** Product Website

### Example 3: Share Link Distribution
1. Alice clicks "Share URL" on "Product Website"
2. System generates token: `abc123xyz`
3. Alice shares: `app.com/review/app-id?token=abc123xyz`
4. Anyone with link can review (no account needed)
5. **Result:** Users accessing via link:
   - ❌ Not in workspace_members
   - ❌ Not in app_collaborators
   - ✅ Temporary access via token
   - Can browse and leave feedback
   - If they sign up later, can be converted to full collaborator

---

## 🛠️ Key Functions & Edge Functions

### Database Functions
- `accept_app_invitation(invitation_token)` - Processes invitation acceptance
- `has_app_access(app_id, user_id)` - Checks if user has access to app
- `expire_old_invitations()` - Cleanup expired invitations

### Edge Functions
- `send-app-invitation` - Sends email invitation via Supabase Auth

### Frontend Pages
- `AppDetails.tsx` - Invite modal & share URL generator
- `AcceptInvitation.tsx` - Handles invitation acceptance
- `PublicReview.tsx` - Validates tokens & user access

---

## 🔍 Checking Access in the UI

### To see app invitations:
```sql
SELECT * FROM app_invitations
WHERE invitee_email = 'user@email.com' OR inviter_id = 'user-id';
```

### To see app collaborators:
```sql
SELECT * FROM app_collaborators
WHERE user_id = 'user-id' OR app_id = 'app-id';
```

### To see share tokens:
```sql
SELECT * FROM app_access_tokens
WHERE app_id = 'app-id' AND is_active = true;
```

### To see workspace members:
```sql
SELECT * FROM workspace_members
WHERE user_id = 'user-id' OR workspace_id = 'workspace-id';
```

---

## ✅ Security Features

1. **RLS Policies** - All tables have proper row-level security
2. **Token Expiration** - Invitations expire after 7 days by default
3. **Token Deactivation** - Share tokens can be deactivated anytime
4. **Access Level Control** - Different permission levels enforced
5. **Workspace Isolation** - Users only see data they have access to
6. **Invitation Tracking** - Full audit trail of who invited whom

---

## 🎯 Summary

- **App invitations by workspace owner** = Full workspace + app access
- **App invitations by collaborator** = App-only access
- **Share links** = Temporary token-based access (no user record created)
- **Workspace members** = Access to all workspace apps automatically
- Complete integration between all access methods with proper RLS enforcement
