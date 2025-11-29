/**
 * ECHO BRANDING CONFIGURATION
 *
 * This file contains all branding settings including product name, taglines,
 * and color palette. Update these values to rebrand the entire application.
 *
 * After making changes:
 * 1. Run: npm run sync-branding
 * 2. Run: npm run build
 */

export const BRANDING = {
  // ============================================================================
  // PRODUCT NAME & IDENTITY
  // ============================================================================

  productName: 'Echo',
  productNameLower: 'echo',

  tagline: 'Universal Feedback Platform',
  taglineShort: 'Collaborative Feedback Made Simple',

  description: 'Pin contextual feedback directly on any web application. Collaborate with your team in real-time, track issues, and ship better products faster.',

  // Extension specific
  extensionDescription: 'Pin contextual feedback directly on any web application. Collaborate in real-time, track issues, and ship better products.',

  // Meta description for SEO
  metaDescription: 'Pin contextual feedback directly on any web application. Collaborate with your team in real-time, track issues, and ship better products.',

  // ============================================================================
  // COLOR PALETTE
  // ============================================================================

  colors: {
    // Primary Brand Colors
    primary: {
      main: '#0f172a',        // Slate 900 - Main brand color
      hover: '#1e293b',       // Slate 800 - Hover state
      light: '#334155',       // Slate 700 - Light variant
      lighter: '#475569',     // Slate 600 - Lighter variant
    },

    // Secondary/Accent Colors
    accent: {
      blue: '#3b82f6',        // Blue 500 - Links, highlights
      blueLight: '#60a5fa',   // Blue 400 - Light blue
      blueDark: '#2563eb',    // Blue 600 - Dark blue
      cyan: '#06b6d4',        // Cyan 500 - Accent
      cyanLight: '#22d3ee',   // Cyan 400 - Light cyan
    },

    // Success/Resolved States
    success: {
      main: '#10b981',        // Green 500 - Success, resolved
      light: '#34d399',       // Green 400 - Light success
      dark: '#059669',        // Green 600 - Dark success
      bg: '#f0fdf4',          // Green 50 - Background
      border: '#bbf7d0',      // Green 200 - Border
    },

    // Error/Danger States
    danger: {
      main: '#ef4444',        // Red 500 - Danger, delete
      light: '#f87171',       // Red 400 - Light danger
      dark: '#dc2626',        // Red 600 - Dark danger
      bg: '#fef2f2',          // Red 50 - Background
      border: '#fecaca',      // Red 200 - Border
    },

    // Warning States
    warning: {
      main: '#f59e0b',        // Amber 500 - Warning
      light: '#fbbf24',       // Amber 400 - Light warning
      dark: '#d97706',        // Amber 600 - Dark warning
      bg: '#fef3c7',          // Amber 50 - Background
      border: '#fde68a',      // Amber 200 - Border
    },

    // Neutral/Gray Scale
    neutral: {
      50: '#fafafa',          // Very light gray
      100: '#f5f5f5',         // Light gray
      200: '#e5e5e5',         // Border gray
      300: '#d4d4d4',         // Medium light gray
      400: '#a3a3a3',         // Medium gray
      500: '#737373',         // Medium dark gray
      600: '#525252',         // Dark gray
      700: '#404040',         // Darker gray
      800: '#262626',         // Very dark gray
      900: '#171717',         // Almost black
    },

    // Slate Scale (Primary neutral)
    slate: {
      50: '#f8fafc',          // Very light slate
      100: '#f1f5f9',         // Light slate
      200: '#e2e8f0',         // Border slate
      300: '#cbd5e1',         // Medium light slate
      400: '#94a3b8',         // Medium slate
      500: '#64748b',         // Medium dark slate
      600: '#475569',         // Dark slate
      700: '#334155',         // Darker slate
      800: '#1e293b',         // Very dark slate
      900: '#0f172a',         // Almost black slate
    },

    // Background Colors
    background: {
      primary: '#ffffff',     // White - Main background
      secondary: '#FAF9F8',   // Beige - Alt background
      tertiary: '#f8fafc',    // Slate 50 - Tertiary background
    },

    // Gradient Definitions
    gradients: {
      hero: 'linear-gradient(to right, #3b82f6, #06b6d4, #3b82f6)',        // Blue to cyan
      primary: 'linear-gradient(to right, #0f172a, #1e293b)',              // Slate gradient
      success: 'linear-gradient(to right, #059669, #10b981)',              // Green gradient
      accent: 'linear-gradient(to right, #3b82f6, #06b6d4)',               // Blue-cyan
      soft: 'linear-gradient(to bottom right, #fce7f3, #e9d5ff, #fef3c7)', // Pink-purple-yellow
    },
  },

  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // ============================================================================
  // SPACING & SIZING
  // ============================================================================

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
  },

  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
};

// Export for Node.js (used in sync scripts)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BRANDING };
}
