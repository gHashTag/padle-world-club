#!/bin/bash

# Vercel Environment Variables Setup Script
# This script automatically sets up all required environment variables for Vercel deployment

echo "🚀 Setting up Vercel environment variables..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Set environment variables
echo "📝 Setting environment variables..."

# Production environment variables
vercel env add NODE_ENV production production
vercel env add JWT_EXPIRES_IN "7d" production
vercel env add API_VERSION "v1" production
vercel env add API_PREFIX "/api" production
vercel env add SWAGGER_ENABLED "true" production
vercel env add SWAGGER_PATH "/api/docs" production
vercel env add SWAGGER_TITLE "Padel World Club API" production
vercel env add SWAGGER_VERSION "1.0.0" production
vercel env add SWAGGER_DESCRIPTION "Modern REST API for Padel Venue Management Platform" production
vercel env add CORS_ORIGIN "*" production
vercel env add CORS_CREDENTIALS "true" production
vercel env add RATE_LIMIT_WINDOW_MS "900000" production
vercel env add RATE_LIMIT_MAX_REQUESTS "100" production
vercel env add LOG_LEVEL "info" production
vercel env add LOG_FORMAT "combined" production

# Preview environment variables (same as production for now)
vercel env add NODE_ENV development preview
vercel env add JWT_EXPIRES_IN "7d" preview
vercel env add API_VERSION "v1" preview
vercel env add API_PREFIX "/api" preview
vercel env add SWAGGER_ENABLED "true" preview
vercel env add CORS_ORIGIN "*" preview

echo "✅ Basic environment variables set!"
echo ""
echo "🔒 IMPORTANT: You still need to set these manually:"
echo "1. DATABASE_URL - Get from Neon Console"
echo "2. JWT_SECRET - Generate a secure random string (32+ characters)"
echo ""
echo "💡 To set them manually:"
echo "vercel env add DATABASE_URL 'your-neon-connection-string' production"
echo "vercel env add JWT_SECRET 'your-secure-jwt-secret' production"
echo ""
echo "🎉 Environment setup completed!"
