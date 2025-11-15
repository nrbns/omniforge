# Running OmniForge Without Docker

Since Docker is not installed, you can still run OmniForge in a limited mode or install Docker.

## Option 1: Install Docker Desktop (Recommended)

### Windows:
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Install and start Docker Desktop
3. Then run: `npm run demo:setup`

## Option 2: Run Backend Only (Without Database)

You can run just the backend API server in demo mode:

```bash
# Set demo mode
$env:DEMO_MODE="true"

# Run backend only
cd apps/backend
npm run dev
```

The backend will start but database operations won't work.

## Option 3: Use External Database Services

Instead of Docker, use:
- **PostgreSQL**: https://www.postgresql.org/download/windows/
- **Redis**: https://github.com/microsoftarchive/redis/releases
- Or use cloud services (Supabase, Redis Cloud, etc.)

Then update `.env` files with connection strings.

## Quick Start After Docker Installation

Once Docker is installed:

```bash
# Start services
npm run docker:up

# Wait for services to be ready
Start-Sleep -Seconds 10

# Generate Prisma client
cd apps/backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Go back to root
cd ../..

# Start in demo mode
$env:DEMO_MODE="true"
npm run dev:demo
```

## Current Status

✅ **Node.js**: Installed (v22.19.0)
✅ **Dependencies**: Installed
❌ **Docker**: Not installed
❌ **Docker Compose**: Not installed

Fix: Install Docker Desktop to proceed.


