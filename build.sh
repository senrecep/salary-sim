#!/bin/bash

# Simple timestamp-based cache busting
BUILD_TIME=$(date +%s)
VERSION="v${BUILD_TIME}"

echo "🚀 Building with version: ${VERSION}"

# Replace {{VERSION}} placeholders in HTML
sed -i.bak "s/{{VERSION}}/${VERSION}/g" src/index.html

# Clean up backup files
rm -f src/index.html.bak

echo "✅ Cache busting applied: ${VERSION}"
echo "📄 Updated files:"
grep -n "v=${VERSION}" src/index.html || echo "⚠️  No version found in HTML"
