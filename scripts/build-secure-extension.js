#!/usr/bin/env node

/**
 * Build Script for Secure Extension Distribution
 * 
 * This script creates a secure version of the extension by:
 * 1. Copying extension files to a dist folder
 * 2. Replacing supabase.config.js with secure version (no keys)
 * 3. Ensuring api-proxy.js is included
 * 4. Creating a zip file ready for distribution
 * 
 * Usage: node scripts/build-secure-extension.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_DIR = path.join(__dirname, '../extension');
const DIST_DIR = path.join(__dirname, '../extension-dist');
const SECURE_CONFIG = path.join(EXTENSION_DIR, 'supabase.config.secure.js');
const REGULAR_CONFIG = path.join(EXTENSION_DIR, 'supabase.config.js');

// Files to copy
const FILES_TO_COPY = [
  'manifest.json',
  'popup.html',
  'popup.js',
  'background.js',
  'content.js',
  'content.css',
  'api-proxy.js',
  'logo-icon.svg',
  'icons',
];

// Files to exclude
const FILES_TO_EXCLUDE = [
  'supabase.config.js', // Will be replaced with secure version
  '*.bak',
  '*.md',
  'README.md',
  'SHARED_APPS_FIX.md',
  'API_KEY_FIX.md',
];

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function shouldExclude(filePath) {
  const fileName = path.basename(filePath);
  return FILES_TO_EXCLUDE.some(pattern => {
    if (pattern.includes('*')) {
      return fileName.endsWith(pattern.replace('*', ''));
    }
    return fileName === pattern;
  });
}

console.log('🔒 Building secure extension distribution...\n');

// Clean dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Copy files
console.log('📁 Copying extension files...');
for (const item of FILES_TO_COPY) {
  const srcPath = path.join(EXTENSION_DIR, item);
  const destPath = path.join(DIST_DIR, item);
  
  if (!fs.existsSync(srcPath)) {
    console.warn(`⚠️  Warning: ${item} not found, skipping...`);
    continue;
  }
  
  const stat = fs.statSync(srcPath);
  if (stat.isDirectory()) {
    copyDirectory(srcPath, destPath);
  } else {
    copyFile(srcPath, destPath);
  }
  console.log(`  ✓ ${item}`);
}

// Copy secure config
console.log('\n🔐 Installing secure configuration...');
if (fs.existsSync(SECURE_CONFIG)) {
  const secureConfigDest = path.join(DIST_DIR, 'supabase.config.js');
  copyFile(SECURE_CONFIG, secureConfigDest);
  console.log('  ✓ Replaced supabase.config.js with secure version');
} else {
  console.error('  ✗ Error: supabase.config.secure.js not found!');
  process.exit(1);
}

// Update manifest to include api-proxy.js
console.log('\n📝 Updating manifest.json...');
const manifestPath = path.join(DIST_DIR, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Add api-proxy.js to content scripts if not already there
if (manifest.content_scripts && manifest.content_scripts[0]) {
  const contentScripts = manifest.content_scripts[0].js || [];
  if (!contentScripts.includes('api-proxy.js')) {
    manifest.content_scripts[0].js = ['api-proxy.js', ...contentScripts];
  }
}

// Add api-proxy.js to background if using service worker
if (manifest.background && manifest.background.service_worker) {
  // Service workers can import scripts, but we'll handle it in background.js
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('  ✓ Updated manifest.json');

// Create README for distribution
const readmeContent = `# Echo Extension - Secure Distribution

This is a secure distribution of the Echo Chrome Extension.

## Installation

1. Open Chrome and go to \`chrome://extensions/\`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this folder

## Security

This distribution uses a secure API proxy. All Supabase requests are routed through the backend server, keeping your database credentials secure.

## Support

For issues or questions, contact: info@analyzthis.ai
`;

fs.writeFileSync(path.join(DIST_DIR, 'README.md'), readmeContent);
console.log('  ✓ Created README.md\n');

console.log('✅ Secure extension build complete!');
console.log(`📦 Distribution folder: ${DIST_DIR}`);
console.log('\n📋 Next steps:');
console.log('  1. Zip the extension-dist folder');
console.log('  2. Share the zip file with testers');
console.log('  3. They can unzip and load it in Chrome Developer Mode');
console.log('\n⚠️  Note: Make sure your API proxy is deployed and accessible!');

