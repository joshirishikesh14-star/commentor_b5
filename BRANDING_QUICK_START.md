# Quick Branding Guide

## 🎨 Change Everything in 3 Steps

### 1. Edit `branding.config.js`

```javascript
export const BRANDING = {
  productName: 'YourApp',           // ← Change this
  productNameLower: 'yourapp',      // ← And this

  tagline: 'Your Tagline',          // ← Update tagline

  colors: {
    primary: {
      main: '#0f172a',              // ← Your main color
      hover: '#1e293b',
    },
    // Full color palette below...
  }
};
```

### 2. Sync to all files

```bash
npm run sync-branding
```

### 3. Build & reload

```bash
npm run build
```

Then reload the Chrome extension.

---

## 🎯 What Gets Updated?

✅ Web app name and title
✅ Extension name and description
✅ All colors across web + extension
✅ TypeScript constants
✅ CSS variables

---

## 🎨 Popular Color Themes

### Slate (Current)
```javascript
primary: { main: '#0f172a' }  // Dark slate
```

### Purple
```javascript
primary: { main: '#7c3aed' }  // Purple 600
```

### Blue
```javascript
primary: { main: '#2563eb' }  // Blue 600
```

### Green
```javascript
primary: { main: '#059669' }  // Emerald 600
```

### Orange
```javascript
primary: { main: '#ea580c' }  // Orange 600
```

---

## 📦 Full Documentation

See `BRANDING_GUIDE.md` for complete details.
