# Secure Extension Distribution Guide

This guide explains how to securely share your Chrome extension with testers without exposing your Supabase API keys.

## ⚠️ Current Security Issue

Your extension currently has Supabase keys hardcoded in:
- `extension/supabase.config.js`
- `extension/background.js`
- `extension/content.js`

Anyone who unzips the extension can see these keys and potentially access your database.

## 🔒 Solution Options

### Option 1: Chrome Web Store (Unlisted) - **RECOMMENDED** ⭐

**Most Secure & Easiest**

1. **Publish to Chrome Web Store as "Unlisted"**
   - Only people with the link can install it
   - Google handles distribution and updates
   - Keys are still visible if someone unzips, but harder to access

2. **Steps:**
   ```bash
   # 1. Zip your extension
   cd extension
   zip -r ../echo-extension.zip . -x "*.md" "*.bak"
   
   # 2. Go to Chrome Web Store Developer Dashboard
   # https://chrome.google.com/webstore/devconsole
   
   # 3. Upload the zip
   # 4. Set visibility to "Unlisted"
   # 5. Share the install link with testers
   ```

**Pros:**
- ✅ Easiest for testers (one-click install)
- ✅ Automatic updates
- ✅ Professional distribution
- ✅ No code changes needed

**Cons:**
- ⚠️ Keys still in code (but harder to access)
- ⚠️ Requires Chrome Web Store account ($5 one-time fee)

---

### Option 2: API Proxy (Most Secure) 🔐

**Best Security - Requires Code Updates**

This routes all Supabase requests through your backend API, keeping keys server-side.

#### Step 1: Deploy the API Proxy

The API proxy is already created at `api/extension-proxy.js`. Deploy it to Vercel:

```bash
# The api/ folder will be automatically deployed to Vercel
# Make sure these environment variables are set in Vercel:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

#### Step 2: Update Extension to Use Proxy

**This requires updating extension files to use the proxy instead of direct Supabase calls.**

**Current Status:** The proxy API is ready, but extension code needs to be updated to use it.

**Quick Fix (Manual):**
1. Replace `extension/supabase.config.js` with `extension/supabase.config.secure.js`
2. Update `extension/api-proxy.js` with your API URL
3. Update extension files to use `SupabaseProxy` instead of direct fetch calls

**Pros:**
- ✅ Keys never exposed to users
- ✅ Full control over API access
- ✅ Can add rate limiting, logging, etc.

**Cons:**
- ⚠️ Requires code refactoring
- ⚠️ More complex setup

---

### Option 3: Code Obfuscation (Quick Fix) 🎭

**Makes Keys Harder to Find (But Not Impossible)**

1. **Minify and obfuscate the code:**

```bash
# Install obfuscation tool
npm install -g javascript-obfuscator

# Obfuscate key files
javascript-obfuscator extension/popup.js --output extension-dist/popup.js
javascript-obfuscator extension/content.js --output extension-dist/content.js
javascript-obfuscator extension/background.js --output extension-dist/background.js
```

2. **Remove comments and minify:**
```bash
# Use a minifier
npx terser extension/popup.js -o extension-dist/popup.js -c -m
```

**Pros:**
- ✅ Quick to implement
- ✅ Makes keys harder to find

**Cons:**
- ⚠️ Not truly secure (determined users can still extract keys)
- ⚠️ Can break extension functionality
- ⚠️ Harder to debug

---

## 🚀 Recommended Approach

**For Quick Testing:** Use **Option 1 (Chrome Web Store Unlisted)**
- Fastest to set up
- Professional distribution
- Easy for testers

**For Production:** Implement **Option 2 (API Proxy)**
- Most secure
- Best long-term solution
- Requires code updates

---

## 📋 Quick Start: Chrome Web Store Distribution

1. **Prepare extension:**
   ```bash
   cd extension
   zip -r ../echo-extension.zip . \
     -x "*.md" "*.bak" "*.log" \
     -x "supabase.config.secure.js" \
     -x "api-proxy.js"
   ```

2. **Go to Chrome Web Store:**
   - Visit: https://chrome.google.com/webstore/devconsole
   - Pay $5 one-time developer fee (if not already paid)
   - Click "New Item"
   - Upload `echo-extension.zip`
   - Fill in store listing details
   - Set visibility to **"Unlisted"**
   - Submit for review (usually takes a few hours)

3. **Share with testers:**
   - After approval, share the install link
   - Testers click "Add to Chrome" - done!

---

## 🔧 Future: Implementing API Proxy

To fully secure the extension with the API proxy:

1. **Update extension files** to check for `useProxy` flag:
   ```javascript
   if (window.SUPABASE_CONFIG?.useProxy) {
     // Use SupabaseProxy from api-proxy.js
     const data = await SupabaseProxy.get('/rest/v1/apps');
   } else {
     // Direct Supabase call (dev mode)
     const data = await fetch(`${SUPABASE_URL}/rest/v1/apps`, {...});
   }
   ```

2. **Deploy API proxy** to Vercel (already created at `api/extension-proxy.js`)

3. **Set environment variables** in Vercel dashboard

4. **Test thoroughly** before distributing

---

## 📞 Need Help?

If you need help implementing any of these options, let me know which approach you'd like to use!

