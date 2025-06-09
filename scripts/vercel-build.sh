#!/bin/bash

# Vercel Build Script for Padel World Club API
echo "🚀 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
bun install --frozen-lockfile

# Type checking (skip for deployment)
echo "🔍 Skipping TypeScript type check for deployment..."

# Build the application
echo "🏗️ Building application..."
bun run build

# Copy necessary files
echo "📁 Copying necessary files..."
mkdir -p dist/api/docs
cp -r src/api/docs/* dist/api/docs/ 2>/dev/null || echo "No docs to copy"

mkdir -p dist/api/views
cp -r src/api/views/* dist/api/views/ 2>/dev/null || echo "No views to copy"

mkdir -p dist/db/migrations
cp -r src/db/migrations/* dist/db/migrations/ 2>/dev/null || echo "No migrations to copy"

# Verify build
echo "✅ Verifying build..."
if [ -f "dist/server.js" ]; then
    echo "✅ Build successful! dist/server.js created"
    ls -la dist/
else
    echo "❌ Build failed! dist/server.js not found"
    exit 1
fi

echo "🎉 Vercel build completed successfully!"
