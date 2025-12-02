/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated from branding.config.js
 * Run 'npm run sync-branding' to update
 */

export const BRANDING = {
  productName: 'Echo',
  productNameLower: 'echo',
  tagline: 'Universal Feedback Platform',
  taglineShort: 'Collaborative Feedback Made Simple',
  description: 'Pin contextual feedback directly on any web application. Collaborate with your team in real-time, track issues, and ship better products faster.',
  metaDescription: 'Pin contextual feedback directly on any web application. Collaborate with your team in real-time, track issues, and ship better products.',

  logo: {
  "type": "image",
  "font": {
    "family": "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    "weight": 700,
    "size": "24px",
    "letterSpacing": "-0.02em",
    "textTransform": "none"
  },
  "images": {
    "main": "/logos/echo.svg",
    "light": "/logos/echo.svg",
    "dark": "/logos/echo.svg",
    "icon": "/favicon.png"
  },
  "extension": {
    "icon16": "icons/icon16.png",
    "icon32": "icons/icon32.png",
    "icon48": "icons/icon48.png",
    "icon128": "icons/icon128.png"
  },
  "favicon": "/favicon.png"
},

  colors: {
  "primary": {
    "main": "#0f172a",
    "hover": "#1e293b",
    "light": "#334155",
    "lighter": "#475569"
  },
  "accent": {
    "blue": "#3b82f6",
    "blueLight": "#60a5fa",
    "blueDark": "#2563eb",
    "cyan": "#06b6d4",
    "cyanLight": "#22d3ee"
  },
  "success": {
    "main": "#10b981",
    "light": "#34d399",
    "dark": "#059669",
    "bg": "#f0fdf4",
    "border": "#bbf7d0"
  },
  "danger": {
    "main": "#ef4444",
    "light": "#f87171",
    "dark": "#dc2626",
    "bg": "#fef2f2",
    "border": "#fecaca"
  },
  "warning": {
    "main": "#f59e0b",
    "light": "#fbbf24",
    "dark": "#d97706",
    "bg": "#fef3c7",
    "border": "#fde68a"
  },
  "neutral": {
    "50": "#fafafa",
    "100": "#f5f5f5",
    "200": "#e5e5e5",
    "300": "#d4d4d4",
    "400": "#a3a3a3",
    "500": "#737373",
    "600": "#525252",
    "700": "#404040",
    "800": "#262626",
    "900": "#171717"
  },
  "slate": {
    "50": "#f8fafc",
    "100": "#f1f5f9",
    "200": "#e2e8f0",
    "300": "#cbd5e1",
    "400": "#94a3b8",
    "500": "#64748b",
    "600": "#475569",
    "700": "#334155",
    "800": "#1e293b",
    "900": "#0f172a"
  },
  "background": {
    "primary": "#ffffff",
    "secondary": "#FAF9F8",
    "tertiary": "#f8fafc"
  },
  "gradients": {
    "hero": "linear-gradient(to right, #3b82f6, #06b6d4, #3b82f6)",
    "primary": "linear-gradient(to right, #0f172a, #1e293b)",
    "success": "linear-gradient(to right, #059669, #10b981)",
    "accent": "linear-gradient(to right, #3b82f6, #06b6d4)",
    "soft": "linear-gradient(to bottom right, #fce7f3, #e9d5ff, #fef3c7)"
  }
},

  typography: {
  "fontFamily": "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  "fontWeights": {
    "normal": 400,
    "medium": 500,
    "semibold": 600,
    "bold": 700
  }
},

  spacing: {
  "xs": "4px",
  "sm": "8px",
  "md": "12px",
  "lg": "16px",
  "xl": "20px",
  "2xl": "24px",
  "3xl": "32px"
},

  borderRadius: {
  "sm": "6px",
  "md": "8px",
  "lg": "12px",
  "xl": "16px",
  "full": "9999px"
},
} as const;
