/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated from branding.config.js
 * Run 'npm run sync-branding' to update
 */

const BRANDING = {
  productName: 'Echo',
  tagline: 'Universal Feedback Platform',

  colors: {
    primary: '#0f172a',
    primaryHover: '#1e293b',
    success: '#10b981',
    danger: '#ef4444',
    blue: '#3b82f6',
    cyan: '#06b6d4',
  }
};

// Make available to content scripts
if (typeof window !== 'undefined') {
  window.ECHO_BRANDING = BRANDING;
}
