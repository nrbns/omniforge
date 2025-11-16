# Docker Installation Checker

Write-Host "Checking Docker installation..." -ForegroundColor Cyan
Write-Host ""

$dockerInstalled = $false
$dockerComposeInstalled = $false

# Check Docker
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker installed:" -ForegroundColor Green
        Write-Host "   $dockerVersion" -ForegroundColor Gray
        $dockerInstalled = $true
    }
} catch {
    Write-Host "❌ Docker NOT found" -ForegroundColor Red
}

# Check Docker Compose
try {
    $composeVersion = docker-compose --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker Compose installed:" -ForegroundColor Green
        Write-Host "   $composeVersion" -ForegroundColor Gray
        $dockerComposeInstalled = $true
    }
} catch {
    Write-Host "❌ Docker Compose NOT found" -ForegroundColor Red
}

# Check if Docker Desktop is running
try {
    $dockerPs = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Docker Desktop is running" -ForegroundColor Green
        Write-Host ""
        return 0
    } else {
        Write-Host ""
        Write-Host "⚠️  Docker Desktop is installed but NOT running" -ForegroundColor Yellow
        Write-Host "   Please start Docker Desktop from the Start menu" -ForegroundColor Yellow
        Write-Host ""
        return 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Cannot connect to Docker daemon" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop" -ForegroundColor Yellow
    Write-Host ""
    return 1
}

if (-not $dockerInstalled -or -not $dockerComposeInstalled) {
    Write-Host ""
    Write-Host "📥 Please install Docker Desktop:" -ForegroundColor Yellow
    Write-Host "   1. Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    Write-Host "   2. Run the installer" -ForegroundColor Cyan
    Write-Host "   3. Restart your computer if prompted" -ForegroundColor Cyan
    Write-Host "   4. Start Docker Desktop from Start menu" -ForegroundColor Cyan
    Write-Host ""
    return 1
}



