# 🚀 Vercel + Neon Deployment Guide

This guide walks you through deploying the Padel World Club API to Vercel with Neon PostgreSQL database.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier available)
- Neon account (free tier available)

## 🗄️ Step 1: Setup Neon Database

### 1.1 Create Neon Project

1. Go to [Neon Console](https://console.neon.tech/)
2. Click "Create Project"
3. Choose:
   - **Project Name**: `padel-world-club`
   - **Database Name**: `padel_db`
   - **Region**: Choose closest to your users
4. Click "Create Project"

### 1.2 Get Database Connection String

1. In Neon dashboard, go to "Connection Details"
2. Copy the connection string (it looks like):
   ```
   postgresql://username:password@hostname/database?sslmode=require
   ```
3. Save this for later use in Vercel

### 1.3 Run Database Migrations

```bash
# Set your Neon database URL
export DATABASE_URL="your-neon-connection-string"

# Run migrations
bun run db:migrate

# Optional: Seed with sample data
bun run db:seed
```

## 🚀 Step 2: Deploy to Vercel

### 2.1 Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `gHashTag/padle-world-club`
4. Click "Import"

### 2.2 Configure Build Settings

Vercel should auto-detect the settings, but verify:

- **Framework Preset**: Other
- **Build Command**: `bun run build:vercel`
- **Output Directory**: `dist`
- **Install Command**: `bun install`

### 2.3 Add Environment Variables

In Vercel project settings, add these environment variables:

```bash
# Application
NODE_ENV=production

# Database (from Neon)
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require

# JWT (generate a secure secret)
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
JWT_EXPIRES_IN=7d

# API Configuration
API_VERSION=v1
API_PREFIX=/api

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=/api/docs
SWAGGER_TITLE=Padel World Club API
SWAGGER_VERSION=1.0.0
SWAGGER_DESCRIPTION=Modern REST API for Padel Venue Management Platform

# CORS
CORS_ORIGIN=*
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined
```

### 2.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your API will be available at: `https://your-project.vercel.app`

## 🧪 Step 3: Test Deployment

### 3.1 Health Check

```bash
curl https://your-project.vercel.app/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-26T10:00:00Z",
    "uptime": 123.45,
    "memory": {...},
    "version": "1.0.0"
  }
}
```

### 3.2 API Documentation

Visit: `https://your-project.vercel.app/api/docs`

You should see the Swagger UI with all API endpoints.

### 3.3 Test API Endpoints

```bash
# Test user registration
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser"
  }'
```

## 🔧 Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain

1. In Vercel project settings, go to "Domains"
2. Add your custom domain (e.g., `api.padel.com`)
3. Configure DNS records as instructed by Vercel
4. SSL certificate will be automatically provisioned

### 4.2 Update CORS Settings

If using a custom domain, update CORS_ORIGIN:

```bash
CORS_ORIGIN=https://your-frontend-domain.com,https://api.padel.com
```

## 📊 Step 5: Monitoring & Analytics

### 5.1 Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor function execution times
3. Track error rates and performance

### 5.2 Database Monitoring

1. Use Neon dashboard to monitor:
   - Connection count
   - Query performance
   - Storage usage
2. Set up alerts for high usage

## 🔄 Step 6: Continuous Deployment

### 6.1 Automatic Deployments

Vercel automatically deploys when you push to:
- **Production**: `main` branch → `https://your-project.vercel.app`
- **Preview**: Other branches → `https://branch-name.your-project.vercel.app`

### 6.2 Environment-Specific Deployments

1. **Production**: Use production database
2. **Preview**: Use development database (optional)

```bash
# Preview environment variables
DATABASE_URL=postgresql://dev-username:password@dev-hostname/dev-database
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check build logs in Vercel dashboard
   # Ensure all dependencies are in package.json
   # Verify TypeScript compilation locally
   bun run typecheck
   ```

2. **Database Connection Issues**:
   ```bash
   # Verify DATABASE_URL format
   # Check Neon database status
   # Ensure SSL mode is required
   ```

3. **Function Timeout**:
   ```bash
   # Optimize database queries
   # Add connection pooling
   # Check function execution time in Vercel dashboard
   ```

### Debug Commands

```bash
# Test build locally
bun run build:vercel

# Test production build
NODE_ENV=production bun run start

# Check database connection
bun run db:studio
```

## 📈 Performance Optimization

### 5.1 Database Optimization

1. **Connection Pooling**: Neon handles this automatically
2. **Query Optimization**: Use indexes and efficient queries
3. **Caching**: Implement Redis caching if needed

### 5.2 Vercel Optimization

1. **Function Regions**: Deploy close to your database
2. **Edge Caching**: Cache static responses
3. **Bundle Size**: Minimize dependencies

## 💰 Cost Considerations

### Vercel Pricing

- **Hobby (Free)**: 100GB bandwidth, 100 function executions/day
- **Pro ($20/month)**: 1TB bandwidth, unlimited functions
- **Enterprise**: Custom pricing

### Neon Pricing

- **Free Tier**: 512MB storage, 1 database
- **Pro ($19/month)**: 10GB storage, multiple databases
- **Scale**: Usage-based pricing

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **JWT Secret**: Use a strong, random secret (32+ characters)
3. **Database**: Use SSL connections (required by Neon)
4. **CORS**: Configure appropriate origins for production
5. **Rate Limiting**: Implement to prevent abuse

## 📝 Next Steps

1. **Custom Domain**: Set up your production domain
2. **Monitoring**: Implement error tracking (Sentry, etc.)
3. **Backup**: Set up database backup strategy
4. **CDN**: Consider Vercel Edge Network for global performance
5. **Scaling**: Monitor usage and upgrade plans as needed

---

Your Padel World Club API is now live on Vercel with Neon PostgreSQL! 🎉

**Live URLs**:
- API: `https://your-project.vercel.app`
- Documentation: `https://your-project.vercel.app/api/docs`
- Health Check: `https://your-project.vercel.app/health`
