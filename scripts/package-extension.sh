#!/bin/bash

# Package Extension for Distribution
# Creates a zip file ready for Chrome Web Store or manual distribution

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
EXTENSION_DIR="$PROJECT_ROOT/extension"
OUTPUT_FILE="$PROJECT_ROOT/echo-extension-$(date +%Y%m%d).zip"

echo "📦 Packaging Echo Extension..."
echo ""

# Check if extension directory exists
if [ ! -d "$EXTENSION_DIR" ]; then
  echo "❌ Error: Extension directory not found at $EXTENSION_DIR"
  exit 1
fi

# Create temporary directory
TEMP_DIR=$(mktemp -d)
EXTENSION_DIST="$TEMP_DIR/echo-extension"

echo "📁 Copying extension files..."

# Copy all files except excluded ones
cd "$EXTENSION_DIR"
find . -type f \
  ! -name "*.md" \
  ! -name "*.bak" \
  ! -name "*.log" \
  ! -name "supabase.config.secure.js" \
  ! -name "api-proxy.js" \
  ! -name "*.DS_Store" \
  ! -path "*/.*" \
  | while read -r file; do
      dest_file="$EXTENSION_DIST/$file"
      dest_dir=$(dirname "$dest_file")
      mkdir -p "$dest_dir"
      cp "$file" "$dest_file"
    done

# Verify manifest exists
if [ ! -f "$EXTENSION_DIST/manifest.json" ]; then
  echo "❌ Error: manifest.json not found!"
  exit 1
fi

# Create zip file
echo ""
echo "🗜️  Creating zip file..."
cd "$TEMP_DIR"
zip -r "$OUTPUT_FILE" echo-extension -q

# Cleanup
rm -rf "$TEMP_DIR"

# Get file size
FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

echo ""
echo "✅ Extension packaged successfully!"
echo ""
echo "📦 Output: $OUTPUT_FILE"
echo "📊 Size: $FILE_SIZE"
echo ""
echo "📋 Next steps:"
echo "   1. Go to https://chrome.google.com/webstore/devconsole"
echo "   2. Upload: $OUTPUT_FILE"
echo "   3. Set visibility to 'Unlisted'"
echo "   4. Share the install link with testers"
echo ""
echo "⚠️  Security Note:"
echo "   This zip still contains Supabase keys. For production,"
echo "   consider implementing the API proxy (see EXTENSION_DISTRIBUTION_GUIDE.md)"

