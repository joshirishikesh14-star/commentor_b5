#!/usr/bin/env node

/**
 * BRANDING SYNC SCRIPT
 *
 * This script syncs branding configuration across all files in the project.
 * Run: npm run sync-branding
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { BRANDING } = await import('./branding.config.js');

console.log('🎨 Syncing branding configuration...\n');

// ============================================================================
// FILE UPDATES
// ============================================================================

const updates = [];

// 1. Update package.json name
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== BRANDING.productNameLower) {
  packageJson.name = BRANDING.productNameLower;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  updates.push('✓ package.json - Updated name');
}

// 2. Update extension manifest
const manifestPath = path.join(__dirname, 'extension', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.name !== BRANDING.productName || manifest.description !== BRANDING.extensionDescription) {
  manifest.name = BRANDING.productName;
  manifest.description = BRANDING.extensionDescription;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  updates.push('✓ extension/manifest.json - Updated name and description');
}

// 3. Update index.html title
const indexHtmlPath = path.join(__dirname, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const newTitle = BRANDING.productName;
if (!indexHtml.includes(`<title>${newTitle}</title>`)) {
  indexHtml = indexHtml.replace(/<title>.*?<\/title>/, `<title>${newTitle}</title>`);
  fs.writeFileSync(indexHtmlPath, indexHtml);
  updates.push('✓ index.html - Updated title');
}

// 4. Update popup.html title
const popupHtmlPath = path.join(__dirname, 'extension', 'popup.html');
let popupHtml = fs.readFileSync(popupHtmlPath, 'utf8');
const popupTitle = `${BRANDING.productName} Extension`;
if (!popupHtml.includes(`<title>${popupTitle}</title>`)) {
  popupHtml = popupHtml.replace(/<title>.*?<\/title>/, `<title>${popupTitle}</title>`);
  popupHtml = popupHtml.replace(/<h1>.*?<\/h1>/, `<h1>${BRANDING.productName}</h1>`);
  popupHtml = popupHtml.replace(/<p>.*?Universal Feedback Platform<\/p>/, `<p>${BRANDING.tagline}</p>`);
  fs.writeFileSync(popupHtmlPath, popupHtml);
  updates.push('✓ extension/popup.html - Updated title and branding');
}

// 5. Create branding constants file for React app
const brandingConstantsPath = path.join(__dirname, 'src', 'lib', 'branding.ts');
const brandingConstants = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated from branding.config.js
 * Run 'npm run sync-branding' to update
 */

export const BRANDING = {
  productName: '${BRANDING.productName}',
  productNameLower: '${BRANDING.productNameLower}',
  tagline: '${BRANDING.tagline}',
  taglineShort: '${BRANDING.taglineShort}',
  description: '${BRANDING.description}',
  metaDescription: '${BRANDING.metaDescription}',

  colors: ${JSON.stringify(BRANDING.colors, null, 2)},

  typography: ${JSON.stringify(BRANDING.typography, null, 2)},

  spacing: ${JSON.stringify(BRANDING.spacing, null, 2)},

  borderRadius: ${JSON.stringify(BRANDING.borderRadius, null, 2)},
} as const;
`;

fs.writeFileSync(brandingConstantsPath, brandingConstants);
updates.push('✓ src/lib/branding.ts - Generated branding constants');

// 6. Create CSS variables file
const cssVarsPath = path.join(__dirname, 'src', 'branding.css');
const cssVars = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated from branding.config.js
 * Run 'npm run sync-branding' to update
 */

:root {
  /* Primary Colors */
  --color-primary: ${BRANDING.colors.primary.main};
  --color-primary-hover: ${BRANDING.colors.primary.hover};
  --color-primary-light: ${BRANDING.colors.primary.light};
  --color-primary-lighter: ${BRANDING.colors.primary.lighter};

  /* Accent Colors */
  --color-accent-blue: ${BRANDING.colors.accent.blue};
  --color-accent-blue-light: ${BRANDING.colors.accent.blueLight};
  --color-accent-blue-dark: ${BRANDING.colors.accent.blueDark};
  --color-accent-cyan: ${BRANDING.colors.accent.cyan};
  --color-accent-cyan-light: ${BRANDING.colors.accent.cyanLight};

  /* Success Colors */
  --color-success: ${BRANDING.colors.success.main};
  --color-success-light: ${BRANDING.colors.success.light};
  --color-success-dark: ${BRANDING.colors.success.dark};
  --color-success-bg: ${BRANDING.colors.success.bg};
  --color-success-border: ${BRANDING.colors.success.border};

  /* Danger Colors */
  --color-danger: ${BRANDING.colors.danger.main};
  --color-danger-light: ${BRANDING.colors.danger.light};
  --color-danger-dark: ${BRANDING.colors.danger.dark};
  --color-danger-bg: ${BRANDING.colors.danger.bg};
  --color-danger-border: ${BRANDING.colors.danger.border};

  /* Warning Colors */
  --color-warning: ${BRANDING.colors.warning.main};
  --color-warning-light: ${BRANDING.colors.warning.light};
  --color-warning-dark: ${BRANDING.colors.warning.dark};
  --color-warning-bg: ${BRANDING.colors.warning.bg};
  --color-warning-border: ${BRANDING.colors.warning.border};

  /* Background Colors */
  --color-bg-primary: ${BRANDING.colors.background.primary};
  --color-bg-secondary: ${BRANDING.colors.background.secondary};
  --color-bg-tertiary: ${BRANDING.colors.background.tertiary};

  /* Gradients */
  --gradient-hero: ${BRANDING.colors.gradients.hero};
  --gradient-primary: ${BRANDING.colors.gradients.primary};
  --gradient-success: ${BRANDING.colors.gradients.success};
  --gradient-accent: ${BRANDING.colors.gradients.accent};
  --gradient-soft: ${BRANDING.colors.gradients.soft};

  /* Typography */
  --font-family: ${BRANDING.typography.fontFamily};
  --font-weight-normal: ${BRANDING.typography.fontWeights.normal};
  --font-weight-medium: ${BRANDING.typography.fontWeights.medium};
  --font-weight-semibold: ${BRANDING.typography.fontWeights.semibold};
  --font-weight-bold: ${BRANDING.typography.fontWeights.bold};

  /* Spacing */
  --spacing-xs: ${BRANDING.spacing.xs};
  --spacing-sm: ${BRANDING.spacing.sm};
  --spacing-md: ${BRANDING.spacing.md};
  --spacing-lg: ${BRANDING.spacing.lg};
  --spacing-xl: ${BRANDING.spacing.xl};
  --spacing-2xl: ${BRANDING.spacing['2xl']};
  --spacing-3xl: ${BRANDING.spacing['3xl']};

  /* Border Radius */
  --radius-sm: ${BRANDING.borderRadius.sm};
  --radius-md: ${BRANDING.borderRadius.md};
  --radius-lg: ${BRANDING.borderRadius.lg};
  --radius-xl: ${BRANDING.borderRadius.xl};
  --radius-full: ${BRANDING.borderRadius.full};
}
`;

fs.writeFileSync(cssVarsPath, cssVars);
updates.push('✓ src/branding.css - Generated CSS variables');

// 7. Create extension branding file
const extBrandingPath = path.join(__dirname, 'extension', 'branding.js');
const extBranding = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated from branding.config.js
 * Run 'npm run sync-branding' to update
 */

const BRANDING = {
  productName: '${BRANDING.productName}',
  tagline: '${BRANDING.tagline}',

  colors: {
    primary: '${BRANDING.colors.primary.main}',
    primaryHover: '${BRANDING.colors.primary.hover}',
    success: '${BRANDING.colors.success.main}',
    danger: '${BRANDING.colors.danger.main}',
    blue: '${BRANDING.colors.accent.blue}',
    cyan: '${BRANDING.colors.accent.cyan}',
  }
};

// Make available to content scripts
if (typeof window !== 'undefined') {
  window.ECHO_BRANDING = BRANDING;
}
`;

fs.writeFileSync(extBrandingPath, extBranding);
updates.push('✓ extension/branding.js - Generated extension branding');

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('BRANDING SYNC COMPLETE');
console.log('='.repeat(60) + '\n');

if (updates.length > 0) {
  updates.forEach(update => console.log(update));
  console.log('\n✨ Successfully updated', updates.length, 'file(s)\n');
  console.log('Current branding:');
  console.log(`  Product Name: ${BRANDING.productName}`);
  console.log(`  Tagline: ${BRANDING.tagline}`);
  console.log(`  Primary Color: ${BRANDING.colors.primary.main}`);
  console.log('\n📦 Next steps:');
  console.log('  1. Run: npm run build');
  console.log('  2. Reload the extension in Chrome');
  console.log('  3. Refresh the web app\n');
} else {
  console.log('✓ All files are already up to date!\n');
}
