#!/bin/bash

# Get git commit hash (short version)
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")
BUILD_TIME=$(date +%s)
VERSION="${GIT_HASH}-${BUILD_TIME}"

echo "🚀 Building with version: ${VERSION}"

# Replace {{VERSION}} placeholders in HTML
sed -i.bak "s/{{VERSION}}/${VERSION}/g" src/index.html

# Clean up backup files
rm -f src/index.html.bak

echo "✅ Cache busting applied: ${VERSION}"
echo "📄 Updated files:"
grep -n "v=${VERSION}" src/index.html || echo "⚠️  No version found in HTML"
