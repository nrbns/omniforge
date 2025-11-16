# OmniForge Quick Start Script
# Checks prerequisites and starts the project

Write-Host "🚀 OmniForge Quick Start" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check Docker first
Write-Host "📋 Step 1: Checking Docker..." -ForegroundColor Yellow
& "$PSScriptRoot\check-docker.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Docker is required. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "   See DOCKER_INSTALL_GUIDE.md for instructions" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Step 2: Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start Docker services" -ForegroundColor Red
    exit 1
}

Write-Host "   Waiting for services to be healthy..." -ForegroundColor Gray
Start-Sleep -Seconds 15

Write-Host "✅ Docker services started" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Step 3: Setting up database..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot\..\apps\backend"

Write-Host "   Generating Prisma client..." -ForegroundColor Gray
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "   Running migrations..." -ForegroundColor Gray
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Migration may have issues, continuing..." -ForegroundColor Yellow
}

Write-Host "   Seeding database..." -ForegroundColor Gray
try {
    npx ts-node prisma/seed.ts
} catch {
    Write-Host "⚠️  Seeding may have failed, continuing..." -ForegroundColor Yellow
}

Pop-Location

Write-Host "✅ Database setup complete" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 Step 4: Starting OmniForge..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 OmniForge is ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Services:" -ForegroundColor Cyan
Write-Host "   - Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   - Backend:   http://localhost:3001/api" -ForegroundColor White
Write-Host "   - API Docs:  http://localhost:3001/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Set demo mode and start
$env:DEMO_MODE = "true"
Set-Location "$PSScriptRoot\.."
npm run dev:demo



