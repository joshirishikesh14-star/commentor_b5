# Chrome Web Store Submission Guide

Your extension is ready! Here's how to submit it to Chrome Web Store as an Unlisted extension.

## Package Created

Extension zip file: `echo-extension-20251202.zip` (64KB)

Location: `/Users/rishikeshjoshi/commentor_B/echo-extension-20251202.zip`

---

## Step-by-Step Submission Process

### Step 1: Chrome Web Store Developer Account

1. Go to Chrome Web Store Developer Dashboard:
   - Visit: https://chrome.google.com/webstore/devconsole
   - Sign in with your Google account

2. Pay Developer Fee (One-Time):
   - If you haven't already, pay the $5 one-time registration fee
   - This is required to publish extensions

---

### Step 2: Create New Extension Item

1. Click "New Item" button (top right)
2. Upload your zip file:
   - Click "Choose file"
   - Select: `echo-extension-20251202.zip`
   - Click "Upload"

3. Wait for upload (usually takes 10-30 seconds)

---

### Step 3: Fill Out Store Listing

You'll need to fill out these sections:

#### 1. Store Listing Tab

**Name:**

Echo - Universal Feedback Platform

**Summary (132 characters max):**

Pin contextual feedback directly on any web application. Collaborate in real-time, track issues, and ship better products.

**Description:**

Echo is a powerful feedback and collaboration tool that lets you pin contextual comments directly on any web application. Perfect for product teams, designers, and developers who need to collect and manage user feedback efficiently.

Key Features:
- Pin comments directly on web pages
- Real-time collaboration with your team
- Screenshot capture for visual context
- Workspace management for organized feedback
- Share apps with testers and reviewers
- Track feedback status and resolve issues

Perfect For:
- Product teams collecting user feedback
- Designers reviewing UI/UX
- Developers tracking bugs and issues
- QA teams testing applications
- Product managers organizing feedback

Privacy and Security:
- All data is securely stored
- Sensitive information is automatically redacted
- Full control over who can access your apps

Get started by creating an account at echo.analyzthis.ai and start collecting feedback today!

**Category:** Productivity

**Language:** English (United States)

**Support URL:** https://echo.analyzthis.ai

**Privacy Policy URL:** https://echo.analyzthis.ai/privacy

#### 2. Privacy Tab

**Single Purpose:**
Yes - The extension is used for collecting and managing feedback on web applications.

**Host Permissions:**
Yes - The extension needs access to all URLs to allow users to add comments on any website they're testing.

**User Data:**
Yes - The extension collects:
- User authentication data (email, name)
- Comments and feedback
- Screenshots and page snapshots (with sensitive data redacted)
- Page URLs where comments are made

All data is stored securely and only accessible to authorized workspace members.

**Data Handling:**
- Data is encrypted in transit and at rest
- Users can delete their data at any time
- Sensitive information (passwords, tokens) is automatically redacted
- Data is only shared with workspace members

#### 3. Distribution Tab

**Visibility:** Unlisted - Only people with the link can find your extension

**Regions:** All regions (or select specific ones)

**Pricing:** Free

---

### Step 4: Upload Store Assets

You'll need these images (create them if needed):

**Small Promo Tile (440x280):**
- Create a promotional image for the store listing

**Marquee Promo Tile (920x680):**
- Larger promotional image

**Screenshots (1280x800 or 640x400):**
- At least 1 screenshot showing the extension in action
- Can show: popup interface, comment pins on a webpage, dashboard view

**Icon (128x128):**
- Already included in your extension (icons/icon128.png)

Tip: You can use your existing logo and create simple screenshots showing the extension UI.

---

### Step 5: Submit for Review

1. Review all information you've entered
2. Click "Submit for Review"
3. Wait for approval (usually 1-3 hours, can take up to 24 hours)

---

### Step 6: Share with Testers

Once approved:

1. Copy the install link from the Chrome Web Store
2. Share with testers - they can click "Add to Chrome" to install
3. No need to share the zip file - Chrome handles everything!

---

## Checklist Before Submitting

- Extension zip file created (echo-extension-20251202.zip)
- Chrome Web Store Developer account created
- $5 developer fee paid
- Store listing information filled out
- Privacy policy URL is accessible (https://echo.analyzthis.ai/privacy)
- Support URL is accessible (https://echo.analyzthis.ai)
- Store assets (screenshots, promo tiles) prepared
- Visibility set to "Unlisted"
- All required fields completed

---

## Creating Store Assets (Quick Guide)

If you need to create screenshots/promo tiles:

1. Screenshots:
   - Take screenshots of your extension popup
   - Show comment pins on a webpage
   - Show the dashboard interface
   - Use a tool like Figma or Canva to create professional-looking images

2. Promo Tiles:
   - Use your Echo logo
   - Add tagline: "Pin feedback directly on any web app"
   - Keep it simple and professional

---

## Important Notes

1. Supabase Keys: The extension still contains Supabase keys. For production, consider implementing the API proxy (see EXTENSION_DISTRIBUTION_GUIDE.md).

2. Updates: When you update the extension:
   - Update version in manifest.json
   - Run npm run package-extension again
   - Upload new zip to Chrome Web Store
   - Changes go live after review (usually faster for updates)

3. Unlisted vs Public:
   - Unlisted: Only people with the link can install (perfect for testing)
   - Public: Anyone can find and install (for production)

---

## Troubleshooting

**Upload fails:**
- Make sure zip file is under 10MB (yours is 64KB - perfect!)
- Check that manifest.json is valid JSON
- Ensure all required icons are included

**Review rejected:**
- Check email for specific reasons
- Common issues: missing privacy policy, unclear permissions, insufficient description
- Fix issues and resubmit

**Extension not working after install:**
- Check browser console for errors
- Verify Supabase URL and keys are correct
- Test locally first before distributing

---

## Need Help?

If you run into any issues during submission, let me know and I can help troubleshoot!

---

## After Approval

Once approved, you'll get:
- A shareable install link
- Automatic updates when you publish new versions
- Analytics on installs and usage
- Professional distribution channel

Share the link with your testers and start collecting feedback!
