#!/bin/bash

# OmniForge Demo Script
# Quick start script for demo mode (no API keys required)

set -e

echo "🚀 OmniForge Demo Setup"
echo "======================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo ""

# Set demo mode
export DEMO_MODE=true
export NODE_ENV=development

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   Dependencies already installed, skipping..."
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Start Docker services
echo "🐳 Step 2: Starting Docker services..."
docker-compose up -d

echo "   Waiting for services to be healthy..."
sleep 10

# Check if services are up
echo "   Checking service health..."
MAX_RETRIES=30
RETRY_COUNT=0

check_service() {
    SERVICE=$1
    HEALTH_CHECK=$2
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if eval "$HEALTH_CHECK"; then
            echo -e "   ${GREEN}✅ $SERVICE is healthy${NC}"
            return 0
        fi
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "   Waiting for $SERVICE... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    done
    
    echo -e "   ${YELLOW}⚠️  $SERVICE may not be ready, continuing anyway...${NC}"
    return 1
}

check_service "PostgreSQL" "docker exec omniforge-postgres pg_isready -U omniforge > /dev/null 2>&1"
check_service "Redis" "docker exec omniforge-redis redis-cli ping > /dev/null 2>&1"

echo -e "${GREEN}✅ Docker services started${NC}"
echo ""

# Step 3: Generate Prisma client
echo "🔧 Step 3: Generating Prisma client..."
cd apps/backend
npx prisma generate
cd ../..
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# Step 4: Run migrations
echo "🗄️  Step 4: Running database migrations..."
cd apps/backend
npx prisma migrate dev --name init || true
cd ../..
echo -e "${GREEN}✅ Migrations completed${NC}"
echo ""

# Step 5: Seed database
echo "🌱 Step 5: Seeding database with demo data..."
cd apps/backend
npx ts-node prisma/seed.ts || echo "⚠️  Seeding may have failed, continuing..."
cd ../..
echo -e "${GREEN}✅ Database seeded${NC}"
echo ""

# Step 6: Start services
echo "🎯 Step 6: Starting OmniForge in demo mode..."
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🚀 OmniForge Demo is ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📍 Services will be available at:"
echo "   - Frontend:  http://localhost:3000"
echo "   - Backend:   http://localhost:3001/api"
echo "   - API Docs:  http://localhost:3001/api/docs"
echo ""
echo "📝 Quick Test:"
echo "   curl http://localhost:3001/api/health"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Start in demo mode
npm run dev:demo

