# Logo Management Guide

## 📁 Quick Overview

Your logo system is centralized in `branding.config.js`. You can use either:
- **Text logos** (current) - Just uses your product name with custom fonts
- **Image logos** - Upload SVG/PNG files and switch with one config change

---

## 🎯 Option 1: Text Logo (Current)

### How it Works
The app displays your `productName` as text with custom styling.

### Customize Font

Edit `branding.config.js`:

```javascript
logo: {
  type: 'text',  // Keep as 'text'

  font: {
    family: 'Inter, sans-serif',        // Your font
    weight: 700,                        // 400=normal, 700=bold, 900=black
    size: '24px',                       // Default size
    letterSpacing: '-0.02em',           // Tight spacing
    textTransform: 'uppercase',         // uppercase, lowercase, capitalize, none
  }
}
```

### Popular Font Combinations

**Modern & Clean:**
```javascript
font: {
  family: 'Inter, -apple-system, sans-serif',
  weight: 600,
  letterSpacing: '-0.01em',
  textTransform: 'none',
}
```

**Bold & Impactful:**
```javascript
font: {
  family: 'Montserrat, sans-serif',
  weight: 800,
  letterSpacing: '-0.03em',
  textTransform: 'uppercase',
}
```

**Elegant & Professional:**
```javascript
font: {
  family: 'Playfair Display, serif',
  weight: 700,
  letterSpacing: '0',
  textTransform: 'none',
}
```

**Tech & Startup:**
```javascript
font: {
  family: 'Space Grotesk, monospace',
  weight: 700,
  letterSpacing: '-0.02em',
  textTransform: 'lowercase',
}
```

---

## 🎯 Option 2: Image Logo

### Step 1: Prepare Your Logo Files

Create these files and place them in `/public/logos/`:

**Required:**
- `logo.svg` - Your main logo (recommended: SVG for quality)
- `logo-dark.svg` - Dark version for light backgrounds
- `logo-light.svg` - Light version for dark backgrounds
- `logo-icon.svg` - Icon only, square format (512x512px)

**Recommended Formats:**
- Primary: SVG (scalable, small file size)
- Alternative: PNG with transparency (2x size for retina)

### Step 2: Create Extension Icons

Place in `/extension/logos/`:

- `icon16.png` - 16×16px (toolbar)
- `icon32.png` - 32×32px (toolbar retina)
- `icon48.png` - 48×48px (extension page)
- `icon128.png` - 128×128px (Chrome Web Store)

**Tips:**
- Use PNG format
- Include transparency
- Keep designs simple (looks good at small sizes)
- Center your icon in the canvas

### Step 3: Update Configuration

Edit `branding.config.js`:

```javascript
logo: {
  type: 'image',  // Changed from 'text' to 'image'

  images: {
    main: '/logos/logo.svg',
    light: '/logos/logo-light.svg',
    dark: '/logos/logo-dark.svg',
    icon: '/logos/logo-icon.svg',
  },

  extension: {
    icon16: 'logos/icon16.png',
    icon32: 'logos/icon32.png',
    icon48: 'logos/icon48.png',
    icon128: 'logos/icon128.png',
  },

  favicon: '/logos/logo-icon.svg',
}
```

### Step 4: Sync & Build

```bash
npm run sync-branding
npm run build
```

---

## 🎨 Using the Logo Component

### In React Components

```tsx
import { Logo } from '@/components/Logo';

function Header() {
  return (
    <div>
      {/* Default logo */}
      <Logo />

      {/* Different sizes */}
      <Logo size="sm" />   {/* 20px */}
      <Logo size="md" />   {/* 24px - default */}
      <Logo size="lg" />   {/* 32px */}
      <Logo size="xl" />   {/* 40px */}

      {/* Variants */}
      <Logo variant="main" />   {/* Default */}
      <Logo variant="light" />  {/* For dark backgrounds */}
      <Logo variant="dark" />   {/* For light backgrounds */}

      {/* Icon only */}
      <Logo showIcon />

      {/* With custom classes */}
      <Logo className="hover:opacity-80" />
    </div>
  );
}
```

### In CSS

```css
.my-logo {
  font-family: var(--logo-font-family);
  font-weight: var(--logo-font-weight);
  font-size: var(--logo-font-size);
  letter-spacing: var(--logo-letter-spacing);
  text-transform: var(--logo-text-transform);
}
```

---

## 📋 File Structure

```
project/
├── branding.config.js          ← Logo configuration here
├── public/
│   └── logos/                  ← Web app logo files
│       ├── logo.svg
│       ├── logo-light.svg
│       ├── logo-dark.svg
│       ├── logo-icon.svg
│       └── README.md
├── extension/
│   └── logos/                  ← Extension icon files
│       ├── icon16.png
│       ├── icon32.png
│       ├── icon48.png
│       ├── icon128.png
│       └── README.md
└── src/
    └── components/
        └── Logo.tsx            ← Reusable logo component
```

---

## 🚀 Complete Rebranding Example

### Scenario: Rebrand to "Feedback Pro" with custom logo

**1. Prepare files:**
```
/public/logos/feedback-pro-logo.svg
/public/logos/feedback-pro-light.svg
/public/logos/feedback-pro-dark.svg
/public/logos/feedback-pro-icon.svg

/extension/logos/icon16.png
/extension/logos/icon32.png
/extension/logos/icon48.png
/extension/logos/icon128.png
```

**2. Update `branding.config.js`:**
```javascript
export const BRANDING = {
  productName: 'Feedback Pro',
  productNameLower: 'feedback-pro',

  logo: {
    type: 'image',  // Switch to image

    images: {
      main: '/logos/feedback-pro-logo.svg',
      light: '/logos/feedback-pro-light.svg',
      dark: '/logos/feedback-pro-dark.svg',
      icon: '/logos/feedback-pro-icon.svg',
    },

    extension: {
      icon16: 'logos/icon16.png',
      icon32: 'logos/icon32.png',
      icon48: 'logos/icon48.png',
      icon128: 'logos/icon128.png',
    },

    favicon: '/logos/feedback-pro-icon.svg',
  },

  colors: {
    primary: { main: '#7c3aed' }  // Purple
  }
};
```

**3. Sync & build:**
```bash
npm run sync-branding
npm run build
```

**Done!** Your entire app now uses "Feedback Pro" branding with your custom logo.

---

## 💡 Pro Tips

### For Text Logos

1. **Use web-safe fonts first**, then add custom fonts via CSS
2. **Keep letter-spacing tight** (-0.02em to -0.01em) for modern look
3. **Bold weights** (600-800) work better than regular (400)
4. **Test at different sizes** to ensure readability

### For Image Logos

1. **SVG is preferred** - scales perfectly, small file size
2. **Include padding** - Don't make logo touch edges
3. **Test on different backgrounds** - Ensure light/dark variants work
4. **Optimize files** - Use SVGO for SVG, TinyPNG for PNG
5. **Monochrome versions** often work better at small sizes

### For Extension Icons

1. **Keep it simple** - Details get lost at 16×16px
2. **Use solid colors** - Gradients don't scale well
3. **Center your design** - Leave padding around edges
4. **Test in toolbar** - Load extension and check appearance
5. **Match brand colors** - But ensure visibility

---

## 🔄 Switching Between Text and Image

You can switch anytime without losing configuration:

**Switch to Image:**
```javascript
logo: { type: 'image' }  // Uses images.main, images.light, etc.
```

**Switch to Text:**
```javascript
logo: { type: 'text' }   // Uses font.family, font.weight, etc.
```

Then run:
```bash
npm run sync-branding && npm run build
```

---

## 📦 What Gets Updated

When you run `npm run sync-branding`, logo settings update:

| File | What Changes |
|------|--------------|
| `src/lib/branding.ts` | Logo config exported as constants |
| `src/branding.css` | CSS variables for font settings |
| `extension/manifest.json` | Extension icon paths |

The `<Logo />` component automatically reads from these generated files.

---

## 🎓 Custom Font Setup (Advanced)

### Using Google Fonts

**1. Add to `index.html`:**
```html
<head>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&display=swap" rel="stylesheet">
</head>
```

**2. Update `branding.config.js`:**
```javascript
logo: {
  font: {
    family: 'Inter, sans-serif',
    weight: 700,
  }
}
```

### Using Custom Font Files

**1. Add fonts to `/public/fonts/`:**
```
/public/fonts/MyFont-Bold.woff2
```

**2. Add to `src/index.css`:**
```css
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/MyFont-Bold.woff2') format('woff2');
  font-weight: 700;
}
```

**3. Update `branding.config.js`:**
```javascript
logo: {
  font: {
    family: 'MyFont, sans-serif',
    weight: 700,
  }
}
```

---

## ❓ FAQ

**Q: Can I use both text and image logos?**
A: No, choose one in config. But you can switch anytime.

**Q: Do I need all logo variants?**
A: For text: No, just configure font. For image: Main logo is required, variants are optional.

**Q: What if I only have one logo color?**
A: Use the same file for main, light, and dark variants.

**Q: Can I use PNG instead of SVG?**
A: Yes, but SVG is recommended for quality and file size.

**Q: How do I update the favicon?**
A: Set `logo.favicon` path in config, then run sync-branding.

**Q: Does this work with the extension too?**
A: Yes! Extension icons auto-update when you sync.

---

## 🐛 Troubleshooting

**Logo not showing:**
1. Check file exists at specified path
2. Verify path starts with `/` for web app
3. Run `npm run sync-branding`
4. Clear browser cache

**Font not loading:**
1. Verify font is imported in HTML/CSS
2. Check font family name matches exactly
3. Ensure font weight exists for specified value

**Extension icons not updating:**
1. Place files in `/extension/logos/`
2. Run `npm run sync-branding`
3. Go to chrome://extensions/
4. Click "Reload" button on your extension

---

For more details, see:
- `BRANDING_GUIDE.md` - Complete branding system
- `branding.config.js` - Source configuration
- `src/components/Logo.tsx` - Logo component code
