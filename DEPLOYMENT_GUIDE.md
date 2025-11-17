# 🚀 OmniForge Deployment Guide

Complete guide for deploying OmniForge to production.

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (for local development)
- PostgreSQL 16+ database
- Redis 7+ (for caching and job queues)
- Neo4j 5+ (optional, for knowledge graph)
- Domain name and SSL certificate (for production)

## 🔧 Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/nrbns/omniforge.git
cd omniforge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env` and set:

```bash
# Production settings
NODE_ENV=production
DEMO_MODE=false

# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host:5432/omniforge

# JWT Secret (REQUIRED - generate strong secret)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# CORS (REQUIRED)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# AI Providers (optional)
HUGGINGFACE_API_KEY=your-key
OPENAI_API_KEY=your-key

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
```

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Run Database Migrations

```bash
npm run db:migrate
```

### 6. Seed Database (Optional)

```bash
npm run db:seed
```

## 🐳 Docker Deployment

### Option 1: Docker Compose (Recommended for Single Server)

1. **Update docker-compose.yml** with production settings:

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    # Remove port exposure in production or use firewall
    # ports:
    #   - "5432:5432"
  
  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    environment:
      DATABASE_URL: postgresql://omniforge:${POSTGRES_PASSWORD}@postgres:5432/omniforge
      REDIS_HOST: redis
      NODE_ENV: production
    depends_on:
      - postgres
      - redis
    ports:
      - "3001:3001"
```

2. **Build and start:**

```bash
docker-compose -f docker-compose.yml up -d
```

### Option 2: Individual Docker Containers

```bash
# Build backend
docker build -f apps/backend/Dockerfile -t omniforge-backend .

# Run backend
docker run -d \
  --name omniforge-backend \
  -p 3001:3001 \
  --env-file apps/backend/.env \
  omniforge-backend
```

## ☁️ Cloud Platform Deployment

### Vercel (Frontend)

1. **Install Vercel CLI:**

```bash
npm i -g vercel
```

2. **Deploy:**

```bash
cd apps/frontend
vercel
```

3. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`

### Railway / Render (Backend)

1. **Connect repository** to Railway/Render
2. **Set environment variables** in dashboard
3. **Deploy** - platform will auto-detect and build

### AWS / GCP / Azure

Use container services (ECS, Cloud Run, Container Instances) with the provided Dockerfile.

## 🔒 Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Configure `ALLOWED_ORIGINS` properly
- [ ] Enable SSL/TLS (HTTPS)
- [ ] Set up firewall rules
- [ ] Enable rate limiting (already implemented)
- [ ] Set up monitoring (Sentry)
- [ ] Configure database backups
- [ ] Set up log aggregation
- [ ] Review and restrict API endpoints

## 📊 Monitoring Setup

### Sentry (Error Tracking)

1. **Create Sentry project** at https://sentry.io
2. **Get DSN** from project settings
3. **Add to .env:**

```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

4. **Install Sentry SDK** (when ready):

```bash
npm install @sentry/node
```

### Health Checks

Monitor these endpoints:

- `GET /api/health` - Overall health
- `GET /api/health/ready` - Readiness (database)
- `GET /api/health/live` - Liveness

## 🔄 CI/CD Pipeline

GitHub Actions is already configured. For production:

1. **Add secrets** to GitHub:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `HUGGINGFACE_API_KEY`
   - etc.

2. **Create production workflow** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        run: |
          # Your deployment commands
```

## 🚨 Rollback Procedure

If deployment fails:

1. **Stop new deployment:**
```bash
docker-compose down
```

2. **Revert to previous version:**
```bash
git checkout <previous-commit>
docker-compose up -d
```

3. **Or restore from backup:**
```bash
# Restore database
pg_restore -d omniforge backup.dump
```

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer:** Use nginx or cloud load balancer
2. **Multiple Backend Instances:** Run multiple containers
3. **Database:** Use read replicas for read-heavy workloads
4. **Redis:** Use Redis Cluster for high availability

### Vertical Scaling

Increase container resources (CPU, memory) as needed.

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check migrations
npm run db:migrate:status
```

### Redis Connection Issues

```bash
# Test Redis
redis-cli -h $REDIS_HOST ping
```

### Build Failures

```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

## 📞 Support

For issues:
- GitHub Issues: https://github.com/nrbns/omniforge/issues
- Documentation: See README.md

---

**Last Updated:** 2025-01-XX

