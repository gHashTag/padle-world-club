#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup via API
 * This script uses Vercel API to programmatically set environment variables
 */

import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Environment variables to set
const envVars = {
  // Application
  NODE_ENV: 'production',
  JWT_EXPIRES_IN: '7d',
  
  // API Configuration
  API_VERSION: 'v1',
  API_PREFIX: '/api',
  
  // Swagger Configuration
  SWAGGER_ENABLED: 'true',
  SWAGGER_PATH: '/api/docs',
  SWAGGER_TITLE: 'Padel World Club API',
  SWAGGER_VERSION: '1.0.0',
  SWAGGER_DESCRIPTION: 'Modern REST API for Padel Venue Management Platform',
  
  // CORS Configuration
  CORS_ORIGIN: '*',
  CORS_CREDENTIALS: 'true',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100',
  
  // Logging
  LOG_LEVEL: 'info',
  LOG_FORMAT: 'combined'
};

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setEnvironmentVariable(key, value, target = 'production') {
  try {
    const command = `vercel env add ${key} "${value}" ${target}`;
    console.log(`Setting ${key}...`);
    execSync(command, { stdio: 'pipe' });
    console.log(`✅ ${key} set successfully`);
  } catch (error) {
    console.log(`⚠️  ${key} might already exist or error occurred`);
  }
}

async function main() {
  console.log('🚀 Vercel Environment Variables Setup\n');
  
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('❌ Vercel CLI not found. Installing...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }
  
  // Check authentication
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    console.log('✅ Already authenticated with Vercel');
  } catch (error) {
    console.log('🔐 Please authenticate with Vercel...');
    execSync('vercel login', { stdio: 'inherit' });
  }
  
  console.log('\n📝 Setting up environment variables...\n');
  
  // Set basic environment variables
  for (const [key, value] of Object.entries(envVars)) {
    await setEnvironmentVariable(key, value, 'production');
    await setEnvironmentVariable(key, value, 'preview');
  }
  
  console.log('\n🔒 Setting up secure variables...\n');
  
  // Get DATABASE_URL
  const databaseUrl = await question('Enter your Neon DATABASE_URL (or press Enter to skip): ');
  if (databaseUrl.trim()) {
    await setEnvironmentVariable('DATABASE_URL', databaseUrl, 'production');
    await setEnvironmentVariable('DATABASE_URL', databaseUrl, 'preview');
  }
  
  // Get JWT_SECRET
  const jwtSecret = await question('Enter your JWT_SECRET (or press Enter to generate): ');
  if (jwtSecret.trim()) {
    await setEnvironmentVariable('JWT_SECRET', jwtSecret, 'production');
    await setEnvironmentVariable('JWT_SECRET', jwtSecret, 'preview');
  } else {
    // Generate a random JWT secret
    const randomSecret = require('crypto').randomBytes(32).toString('hex');
    console.log(`Generated JWT_SECRET: ${randomSecret}`);
    await setEnvironmentVariable('JWT_SECRET', randomSecret, 'production');
    await setEnvironmentVariable('JWT_SECRET', randomSecret, 'preview');
  }
  
  console.log('\n🎉 Environment variables setup completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy your project: vercel --prod');
  console.log('2. Check your deployment: vercel ls');
  console.log('3. View logs: vercel logs');
  
  rl.close();
}

main().catch(console.error);
