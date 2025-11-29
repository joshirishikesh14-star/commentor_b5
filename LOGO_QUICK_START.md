# Logo Quick Start

## 📝 Current Setup: Text Logo

Your app currently uses **text-based logos** (displays "Echo" as styled text).

---

## 🎨 Option 1: Customize Text Logo Font

Edit `branding.config.js`:

```javascript
logo: {
  type: 'text',
  font: {
    family: 'Inter, sans-serif',      // ← Your font
    weight: 700,                       // ← 400-900 (boldness)
    size: '24px',
    letterSpacing: '-0.02em',          // ← Tight/loose
    textTransform: 'uppercase',        // ← uppercase, lowercase, none
  }
}
```

Then run:
```bash
npm run sync-branding && npm run build
```

---

## 🖼️ Option 2: Switch to Image Logo

### Step 1: Add your logo files to `/public/logos/`:
- `logo.svg` (or .png)
- `logo-light.svg` (optional)
- `logo-dark.svg` (optional)
- `logo-icon.svg` (square icon)

### Step 2: Add extension icons to `/extension/logos/`:
- `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`

### Step 3: Edit `branding.config.js`:
```javascript
logo: {
  type: 'image',  // ← Change from 'text' to 'image'
  // ... rest stays the same
}
```

### Step 4: Sync & build:
```bash
npm run sync-branding && npm run build
```

---

## 📦 File Locations

```
public/logos/          ← Web app logos (SVG/PNG)
extension/logos/       ← Chrome extension icons (PNG)
branding.config.js     ← Logo configuration
src/components/Logo.tsx ← Reusable logo component
```

---

## 🎯 Using Logo in Code

```tsx
import { Logo } from '@/components/Logo';

<Logo />                    // Default
<Logo size="sm" />          // Small
<Logo size="lg" />          // Large
<Logo variant="light" />    // Light version
<Logo showIcon />           // Icon only
```

---

## 📖 Full Documentation

See **`LOGO_GUIDE.md`** for:
- Detailed instructions
- Font examples
- Image requirements
- Custom font setup
- Troubleshooting
