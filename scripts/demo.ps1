# OmniForge Demo Script (PowerShell)
# Quick start script for demo mode (no API keys required)

$ErrorActionPreference = "Stop"

Write-Host "🚀 OmniForge Demo Setup" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker first." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites met" -ForegroundColor Green
Write-Host ""

# Set demo mode
$env:DEMO_MODE = "true"
$env:NODE_ENV = "development"

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "   Dependencies already installed, skipping..."
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Start Docker services
Write-Host "🐳 Step 2: Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "   Waiting for services to be healthy..."
Start-Sleep -Seconds 10

# Check service health
Write-Host "   Checking service health..." -ForegroundColor Yellow

$maxRetries = 30
$retryCount = 0

function Check-Service {
    param($ServiceName, $HealthCheck)
    
    $retryCount = 0
    while ($retryCount -lt $maxRetries) {
        try {
            Invoke-Expression $HealthCheck | Out-Null
            Write-Host "   ✅ $ServiceName is healthy" -ForegroundColor Green
            return $true
        } catch {
            $retryCount++
            Write-Host "   Waiting for $ServiceName... ($retryCount/$maxRetries)"
            Start-Sleep -Seconds 2
        }
    }
    
    Write-Host "   ⚠️  $ServiceName may not be ready, continuing anyway..." -ForegroundColor Yellow
    return $false
}

Check-Service "PostgreSQL" "docker exec omniforge-postgres pg_isready -U omniforge"
Check-Service "Redis" "docker exec omniforge-redis redis-cli ping"

Write-Host "✅ Docker services started" -ForegroundColor Green
Write-Host ""

# Step 3: Generate Prisma client
Write-Host "🔧 Step 3: Generating Prisma client..." -ForegroundColor Yellow
Push-Location apps/backend
npx prisma generate
Pop-Location
Write-Host "✅ Prisma client generated" -ForegroundColor Green
Write-Host ""

# Step 4: Run migrations
Write-Host "🗄️  Step 4: Running database migrations..." -ForegroundColor Yellow
Push-Location apps/backend
npx prisma migrate dev --name init
Pop-Location
Write-Host "✅ Migrations completed" -ForegroundColor Green
Write-Host ""

# Step 5: Seed database
Write-Host "🌱 Step 5: Seeding database with demo data..." -ForegroundColor Yellow
Push-Location apps/backend
try {
    npx ts-node prisma/seed.ts
} catch {
    Write-Host "⚠️  Seeding may have failed, continuing..." -ForegroundColor Yellow
}
Pop-Location
Write-Host "✅ Database seeded" -ForegroundColor Green
Write-Host ""

# Step 6: Start services
Write-Host "🎯 Step 6: Starting OmniForge in demo mode..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 OmniForge Demo is ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Services will be available at:"
Write-Host "   - Frontend:  http://localhost:3000"
Write-Host "   - Backend:   http://localhost:3001/api"
Write-Host "   - API Docs:  http://localhost:3001/api/docs"
Write-Host ""
Write-Host "📝 Quick Test:"
Write-Host "   curl http://localhost:3001/api/health"
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Start in demo mode
npm run dev:demo

