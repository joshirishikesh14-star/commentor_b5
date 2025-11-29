# Echo Branding System

## Quick Start

To rebrand the entire application (name, tagline, colors), follow these steps:

### 1. Edit Branding Configuration

Open `branding.config.js` and update the values:

```javascript
export const BRANDING = {
  // Change the product name
  productName: 'YourApp',
  productNameLower: 'yourapp',

  // Update taglines
  tagline: 'Your Tagline Here',
  taglineShort: 'Short Version',

  // Modify color palette
  colors: {
    primary: {
      main: '#0f172a',  // Change to your brand color
      hover: '#1e293b',
      // ... more colors
    },
    // ... more color definitions
  }
};
```

### 2. Sync Branding Across Project

Run the sync command:

```bash
npm run sync-branding
```

This will automatically update:
- ✅ `package.json` - Package name
- ✅ `index.html` - Page title
- ✅ `extension/manifest.json` - Extension name and description
- ✅ `extension/popup.html` - Extension popup branding
- ✅ `src/lib/branding.ts` - TypeScript constants for React
- ✅ `src/branding.css` - CSS variables
- ✅ `extension/branding.js` - Extension branding constants

### 3. Build the Project

```bash
npm run build
```

### 4. Reload Extension

Go to Chrome extensions (chrome://extensions/) and click "Reload" on your extension.

---

## What Can You Customize?

### Product Identity

```javascript
productName: 'Echo',              // Main product name
productNameLower: 'echo',          // Lowercase version (for URLs, package name)
tagline: 'Universal Feedback Platform',
taglineShort: 'Collaborative Feedback Made Simple',
description: 'Pin contextual feedback...',
```

### Color Palette

The branding system includes a comprehensive color palette:

#### Primary Colors
Your main brand colors for buttons, headers, and key UI elements:
- `primary.main` - Main brand color
- `primary.hover` - Hover state
- `primary.light` - Light variant
- `primary.lighter` - Lighter variant

#### Accent Colors
Additional colors for highlights and interactive elements:
- `accent.blue` - Blue accent
- `accent.cyan` - Cyan accent
- Multiple variants (light, dark)

#### Semantic Colors
Colors with specific meanings:
- `success.*` - Green colors for success states, resolved items
- `danger.*` - Red colors for errors, delete actions
- `warning.*` - Yellow/amber colors for warnings
- Each includes: main, light, dark, bg, border variants

#### Neutral Colors
Gray scale for text, borders, and backgrounds:
- `neutral.50` to `neutral.900` - Gray scale
- `slate.50` to `slate.900` - Slate scale (primary neutral)

#### Backgrounds
- `background.primary` - Main background (white)
- `background.secondary` - Alternate background (beige)
- `background.tertiary` - Tertiary background

#### Gradients
Pre-defined gradient combinations:
- `gradients.hero` - For hero sections
- `gradients.primary` - Primary gradient
- `gradients.success` - Success gradient
- `gradients.accent` - Accent gradient
- `gradients.soft` - Soft multi-color gradient

### Typography

```javascript
typography: {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
}
```

### Spacing & Sizing

```javascript
spacing: {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
}

borderRadius: {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
}
```

---

## How It Works

### Architecture

The branding system uses a single source of truth pattern:

```
branding.config.js (SOURCE OF TRUTH)
        ↓
  npm run sync-branding
        ↓
    ┌───────────────────────┐
    ↓                       ↓
React App              Extension
- branding.ts          - branding.js
- branding.css         - manifest.json
- index.html           - popup.html
```

### Generated Files

**DO NOT EDIT THESE FILES DIRECTLY** - They are auto-generated:

1. **`src/lib/branding.ts`**
   - TypeScript constants for React components
   - Use: `import { BRANDING } from '@/lib/branding'`

2. **`src/branding.css`**
   - CSS variables for stylesheets
   - Use: `var(--color-primary)`

3. **`extension/branding.js`**
   - JavaScript constants for extension
   - Available as `window.ECHO_BRANDING`

### Using Branding in Code

#### React Components

```tsx
import { BRANDING } from '@/lib/branding';

function Header() {
  return (
    <h1 style={{ color: BRANDING.colors.primary.main }}>
      {BRANDING.productName}
    </h1>
  );
}
```

#### CSS/Tailwind

```css
.button {
  background: var(--color-primary);
  color: white;
}

.button:hover {
  background: var(--color-primary-hover);
}
```

#### Extension Content Scripts

```javascript
// branding.js is loaded automatically
const brandColor = window.ECHO_BRANDING.colors.primary;
pin.style.background = brandColor;
```

---

## Example Rebranding

Let's say you want to rebrand from "Echo" to "Feedback Pro" with a purple theme:

### Step 1: Update `branding.config.js`

```javascript
export const BRANDING = {
  productName: 'Feedback Pro',
  productNameLower: 'feedback-pro',
  tagline: 'Professional Feedback Management',
  taglineShort: 'Feedback Made Professional',

  colors: {
    primary: {
      main: '#7c3aed',        // Purple 600
      hover: '#6d28d9',       // Purple 700
      light: '#8b5cf6',       // Purple 500
      lighter: '#a78bfa',     // Purple 400
    },
    // ... rest stays the same or customize further
  }
};
```

### Step 2: Sync

```bash
npm run sync-branding
```

Output:
```
✓ package.json - Updated name
✓ extension/manifest.json - Updated name and description
✓ extension/popup.html - Updated title and branding
✓ src/lib/branding.ts - Generated branding constants
✓ src/branding.css - Generated CSS variables
✓ extension/branding.js - Generated extension branding

Current branding:
  Product Name: Feedback Pro
  Tagline: Professional Feedback Management
  Primary Color: #7c3aed
```

### Step 3: Build & Deploy

```bash
npm run build
```

**That's it!** Your entire app is now rebranded as "Feedback Pro" with purple colors.

---

## Color Customization Examples

### Blue Theme (Current)
```javascript
colors: {
  primary: { main: '#0f172a', hover: '#1e293b' },  // Slate
  accent: { blue: '#3b82f6', cyan: '#06b6d4' },    // Blue/Cyan
}
```

### Purple Theme
```javascript
colors: {
  primary: { main: '#7c3aed', hover: '#6d28d9' },  // Purple
  accent: { blue: '#8b5cf6', cyan: '#a78bfa' },    // Light purples
}
```

### Green Theme
```javascript
colors: {
  primary: { main: '#059669', hover: '#047857' },  // Emerald
  accent: { blue: '#10b981', cyan: '#34d399' },    // Green variants
}
```

### Orange Theme
```javascript
colors: {
  primary: { main: '#ea580c', hover: '#c2410c' },  // Orange
  accent: { blue: '#f97316', cyan: '#fb923c' },    // Orange variants
}
```

---

## Best Practices

### Do's ✅
- Always use `npm run sync-branding` after editing `branding.config.js`
- Use CSS variables in stylesheets: `var(--color-primary)`
- Import TypeScript constants in React: `import { BRANDING } from '@/lib/branding'`
- Test both web app AND extension after rebranding
- Keep colors accessible (check contrast ratios)

### Don'ts ❌
- Don't edit generated files (`branding.ts`, `branding.css`, `extension/branding.js`)
- Don't hardcode colors in components - use branding constants
- Don't skip the sync step - files won't update automatically
- Don't forget to rebuild after syncing

---

## Troubleshooting

### Changes not appearing?

1. Did you run `npm run sync-branding`?
2. Did you rebuild? `npm run build`
3. Did you reload the extension in Chrome?
4. Did you hard refresh the web app? (Cmd/Ctrl + Shift + R)

### TypeScript errors after renaming?

Run:
```bash
npm run typecheck
```

If there are errors, search for hardcoded references to "Echo" in your code.

### Extension not updating?

1. Go to `chrome://extensions/`
2. Find your extension
3. Click "Reload" button
4. Close and reopen the popup

---

## Files Updated by Sync

| File | What Updates |
|------|--------------|
| `package.json` | Package name |
| `index.html` | Page title |
| `extension/manifest.json` | Extension name, description |
| `extension/popup.html` | Extension popup title, header, tagline |
| `src/lib/branding.ts` | TypeScript constants (auto-generated) |
| `src/branding.css` | CSS variables (auto-generated) |
| `extension/branding.js` | Extension constants (auto-generated) |

---

## Advanced Customization

### Adding New Colors

1. Add to `branding.config.js`:
```javascript
colors: {
  custom: {
    purple: '#9333ea',
    pink: '#ec4899',
  }
}
```

2. Run sync:
```bash
npm run sync-branding
```

3. Use in code:
```tsx
import { BRANDING } from '@/lib/branding';
const myColor = BRANDING.colors.custom.purple;
```

Or in CSS:
```css
.element {
  color: var(--color-custom-purple); // Auto-generated
}
```

### Adding New Typography

```javascript
typography: {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
  }
}
```

---

## Support

For questions about the branding system:
1. Check this guide first
2. Review `branding.config.js` comments
3. Run `npm run sync-branding` to see what gets updated
4. Check the generated files in `src/lib/` and `extension/`

Happy branding! 🎨
