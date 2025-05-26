#!/bin/bash

# Import environment variables from .env file to Vercel
# This script reads .env.vercel and imports all variables to Vercel

echo "🚀 Importing environment variables to Vercel..."

# Check if .env.vercel exists
if [ ! -f ".env.vercel" ]; then
    echo "❌ .env.vercel file not found!"
    echo "💡 Create .env.vercel with your environment variables first"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

echo "📝 Reading .env.vercel and setting variables..."

# Read .env.vercel and set each variable
while IFS='=' read -r key value; do
    # Skip empty lines and comments
    if [[ -z "$key" || "$key" =~ ^#.* ]]; then
        continue
    fi
    
    # Remove quotes from value if present
    value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']$//')
    
    echo "Setting $key..."
    
    # Set for production
    echo "$value" | vercel env add "$key" production
    
    # Set for preview
    echo "$value" | vercel env add "$key" preview
    
done < .env.vercel

echo "✅ Environment variables imported successfully!"
echo ""
echo "🔍 To verify, run: vercel env ls"
echo "🚀 To deploy, run: vercel --prod"
