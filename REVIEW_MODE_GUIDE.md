# Review Mode Guide - How to See Comments on Live Pages

## What is Review Mode?

When you (or anyone with access) visits a webpage that has comments, Echo automatically detects it and shows:
1. **📍 Comment Pins** - Pulsating pins directly on the webpage elements
2. **💬 FAB Button** - Floating Action Button in the bottom-right to view all comments

## How It Works

### Auto-Detection
Echo automatically enters "Review Mode" when:
1. You're logged into the extension
2. You visit a URL that matches an app you have access to
3. There are comments on that page

### Visual Elements

#### 1. Comment Pins on Elements
- **Blue pulsating pins** = Unresolved comments
- **Green pins** = Resolved comments
- **Number inside pin** = Count of comments in thread
- **Glow animation** = Pins attached to actual DOM elements

**Pin Behavior:**
- **Hover:** Pin scales up + highlights the element it's attached to
- **Click:** Opens the thread viewer with all comments

#### 2. FAB (Floating Action Button)
- **Location:** Bottom-right corner
- **Icon:** Blue gradient bubble with message icon
- **Badge:** Red count of unresolved comments
- **Tooltip:** Shows app name and "Click to view comments"

**FAB Behavior:**
- **Click:** Opens/closes the comments panel sidebar
- **Hover:** Tooltip appears with app info

#### 3. Comments Panel Sidebar
- **Slides in from right side**
- **Shows all comment threads** on current page
- **Each thread displays:**
  - First comment text
  - Author name
  - Timestamp
  - Comment count
  - Resolved/Open status
- **Click thread:** Highlights the pin and scrolls to it

## Current Spec

### Pin Animation
```css
@keyframes echo-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
}
```
- Continuous pulsing glow
- 2 second cycle
- Blue glow (matches brand color)

### Pin Styles
- **Size:** 32x32px circle
- **Colors:**
  - Unresolved: Blue gradient `#3b82f6` → `#1d4ed8`
  - Resolved: Green gradient `#10B981` → `#059669`
- **Border:** 2px white
- **Shadow:** `0 2px 8px rgba(0,0,0,0.3)`
- **Z-index:** 999997 (999999 on hover)

### FAB Styles
- **Size:** 56x56px circle
- **Color:** Blue gradient `#3b82f6` → `#1d4ed8`
- **Shadow:** `0 4px 20px rgba(59, 130, 246, 0.4)`
- **Badge:** Red `#ef4444`, 20x20px min, top-right corner

## Testing Review Mode

### Step 1: Create Comments (as App Owner)
1. Open extension popup
2. Select your app
3. Click "Start Recording"
4. Click on elements and add comments
5. Click "Stop Recording"

### Step 2: View Comments (as Reviewer)
1. Make sure you're logged in to the extension
2. Visit the app's URL in a new tab
3. **Auto-detection should trigger:**
   - Comment pins appear on elements
   - FAB appears in bottom-right
   - Console shows: `👁️ Echo: Entering review mode for [app name]`

### Step 3: Interact with Comments
1. **Hover over a pin** → Element highlights
2. **Click a pin** → Thread viewer opens
3. **Click FAB** → Comments panel slides in
4. **Click thread in panel** → Scrolls to pin

## Troubleshooting

### FAB Not Showing?

**Check:**
1. **Are you logged in?** Open popup and verify
2. **Does the URL match?** 
   - App URL: `https://example.com`
   - Current URL must start with: `https://example.com`
3. **Are there comments?** Check dashboard
4. **Console errors?** 
   - Open DevTools → Console
   - Look for Echo logs starting with 🔍, 👁️, ✅

### Pins Not Showing?

**Check:**
1. **Is FAB visible?** If no FAB, auto-detection didn't trigger
2. **Are comments on this specific page URL?** Each page has separate comments
3. **Console logs:**
   ```
   👁️ Echo: Entering review mode
   ✅ Echo: Found element for thread [id]
   ```

### Auto-Detection Failed?

**Possible causes:**
1. **Domain mismatch** - `www.example.com` vs `example.com`
2. **Protocol mismatch** - `http://` vs `https://`
3. **Extension not loaded** - Reload extension in `chrome://extensions`
4. **RLS policies** - Check if you have access to the app

**Manual workaround:**
1. Open extension popup
2. Select the app manually
3. Click "Go to Page"
4. Click "Start Recording" (will enter review mode)

## Code References

### Auto-Detection Entry Point
File: `extension/content.js`
- Line ~160: `enterReviewMode()` function
- Line ~178: `showReviewFAB()` call
- Line ~423: `displayCommentPinsOnElements()` function

### FAB Implementation
File: `extension/content.js`
- Line ~182-273: `showReviewFAB()` and `updateReviewFABCount()`

### Pin Creation
File: `extension/content.js`
- Line ~453-558: `createSmartCommentPin(thread)`
- Line ~427-441: Animation keyframes

## What Users Should See

### Scenario 1: Author Revisiting Their App
"I created 5 comments on my dashboard page yesterday. Today when I visit the dashboard:"
- ✅ FAB shows "5" in red badge
- ✅ 5 blue pulsating pins on elements
- ✅ Click FAB → See all 5 threads
- ✅ Click pin → View thread details

### Scenario 2: Reviewer Checking Shared App
"My colleague shared an app with me. I visit the URL:"
- ✅ Auto-detects I have access
- ✅ Shows FAB with comment count
- ✅ Shows all pins they created
- ✅ I can view but not add new comments (depends on role)

### Scenario 3: Non-Logged-In User
"I'm not logged in to the extension:"
- ❌ No FAB
- ❌ No pins
- ❌ No auto-detection
- Action: Log in via extension popup

## Future Enhancements

- [ ] **Real-time updates** - New comments appear without refresh
- [ ] **Reply in-context** - Add replies directly from pins
- [ ] **Filter by status** - Show only unresolved
- [ ] **Keyboard shortcuts** - Navigate between pins
- [ ] **Pin colors** - Different colors for priority/type
- [ ] **Animations** - Smooth scroll to pin when clicked
- [ ] **Comments panel search** - Find specific comments
- [ ] **Mini-map** - See where all pins are on page

---

*Last Updated: December 2, 2024*

