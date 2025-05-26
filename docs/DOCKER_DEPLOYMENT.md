# 🐳 Docker Deployment Guide

This guide covers how to deploy the Padel World Club API using Docker and Docker Compose for both development and production environments.

## 📋 Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Git** for cloning the repository
- **Environment variables** configured properly

## 🚀 Quick Start

### Development Environment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gHashTag/padle-world-club.git
   cd padle-world-club
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development stack**:
   ```bash
   # Start all services
   docker-compose -f docker-compose.dev.yml up -d

   # Or start with database seeding
   docker-compose -f docker-compose.dev.yml --profile seed up -d

   # Or start with Drizzle Studio
   docker-compose -f docker-compose.dev.yml --profile studio up -d
   ```

4. **Access the application**:
   - **API**: http://localhost:3000
   - **API Documentation**: http://localhost:3000/api/docs
   - **Drizzle Studio**: http://localhost:4983 (if studio profile is active)

### Production Environment

1. **Set up environment**:
   ```bash
   cp .env.example .env.production
   # Configure production values
   ```

2. **Start production stack**:
   ```bash
   # Start core services
   docker-compose up -d

   # Or with NGINX reverse proxy
   docker-compose --profile production up -d
   ```

## 🏗️ Architecture Overview

### Multi-Stage Dockerfile

The Dockerfile uses a multi-stage build approach:

- **Stage 1 (deps)**: Install production dependencies
- **Stage 2 (builder)**: Build the application
- **Stage 3 (runtime)**: Final production image

### Services

#### Core Services
- **api**: Main API application
- **postgres**: PostgreSQL database
- **redis**: Cache and session store

#### Development Services
- **api-dev**: Development API with hot reload
- **migrator**: Database migration runner
- **seeder**: Database seeding (optional)
- **drizzle-studio**: Database GUI (optional)

#### Production Services
- **nginx**: Reverse proxy and load balancer
- **migrator**: Database migration runner

## 🔧 Configuration

### Environment Variables

Create appropriate `.env` files for each environment:

#### Development (.env)
```env
# Database
DATABASE_URL=postgresql://padel_user:padel_password@postgres:5432/padel_db
POSTGRES_DB=padel_db
POSTGRES_USER=padel_user
POSTGRES_PASSWORD=padel_password

# Application
NODE_ENV=development
PORT=3000
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://redis:6379
```

#### Production (.env.production)
```env
# Database (use your production database URL)
DATABASE_URL=postgresql://user:password@host:5432/database
POSTGRES_PASSWORD=secure_production_password

# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=secure_redis_password
```

### Docker Compose Profiles

Use profiles to control which services to start:

```bash
# Development with all tools
docker-compose -f docker-compose.dev.yml --profile studio --profile seed up -d

# Production with NGINX
docker-compose --profile production up -d

# Testing environment
docker-compose -f docker-compose.dev.yml --profile test up -d
```

## 🗄️ Database Management

### Migrations

```bash
# Run migrations
docker-compose exec api bun run db:migrate

# Or use the migrator service
docker-compose up migrator
```

### Seeding

```bash
# Seed database with sample data
docker-compose -f docker-compose.dev.yml --profile seed up seeder

# Or manually
docker-compose exec api bun run db:seed
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U padel_user -d padel_db

# Access Drizzle Studio
docker-compose -f docker-compose.dev.yml --profile studio up drizzle-studio
# Then visit http://localhost:4983
```

## 🧪 Testing

### Run Tests in Docker

```bash
# Run all tests
docker-compose -f docker-compose.dev.yml --profile test up test

# Run specific test suites
docker-compose exec api bun run test:unit
docker-compose exec api bun run test:integration
docker-compose exec api bun run test:e2e
```

## 📊 Monitoring & Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api

# With timestamps
docker-compose logs -f -t api
```

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Detailed health status
docker inspect padel-api --format='{{.State.Health.Status}}'
```

## 🔒 Security Considerations

### Production Security

1. **Use secrets management**:
   ```bash
   # Use Docker secrets for sensitive data
   echo "your-jwt-secret" | docker secret create jwt_secret -
   ```

2. **Non-root user**: All containers run as non-root users

3. **Network isolation**: Services communicate through internal networks

4. **Resource limits**: Set appropriate CPU and memory limits

### NGINX Security

The NGINX configuration includes:
- Rate limiting
- Security headers
- SSL/TLS configuration
- Request size limits

## 🚀 Deployment Strategies

### Blue-Green Deployment

```bash
# Start new version (green)
docker-compose -f docker-compose.green.yml up -d

# Switch traffic (update load balancer)
# Stop old version (blue)
docker-compose -f docker-compose.blue.yml down
```

### Rolling Updates

```bash
# Update API service
docker-compose up -d --no-deps api

# Update with zero downtime
docker-compose up -d --scale api=2
docker-compose stop api_1
docker-compose up -d --scale api=1
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   
   # Use different ports
   PORT=3001 docker-compose up -d
   ```

2. **Database connection issues**:
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec api bun run db:test-connection
   ```

3. **Build issues**:
   ```bash
   # Clean build
   docker-compose build --no-cache
   
   # Remove all containers and volumes
   docker-compose down -v
   docker system prune -a
   ```

### Performance Tuning

1. **Database optimization**:
   ```yaml
   postgres:
     command: postgres -c shared_preload_libraries=pg_stat_statements
   ```

2. **Redis optimization**:
   ```yaml
   redis:
     command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
   ```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale API instances
docker-compose up -d --scale api=3

# Use load balancer
docker-compose --profile production up -d
```

### Resource Limits

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## 🔄 Backup & Recovery

### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U padel_user padel_db > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U padel_user padel_db < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v padel_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

---

This deployment guide provides a comprehensive approach to running the Padel World Club API in containerized environments with proper security, monitoring, and scalability considerations.
