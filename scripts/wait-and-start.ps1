# Wait for Docker to be installed and start OmniForge

Write-Host "🔍 Checking for Docker..." -ForegroundColor Cyan
Write-Host ""

$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    try {
        $dockerVersion = docker --version 2>&1
        $dockerPs = docker ps 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker is installed and running!" -ForegroundColor Green
            Write-Host "   $dockerVersion" -ForegroundColor Gray
            Write-Host ""
            Write-Host "🚀 Starting OmniForge..." -ForegroundColor Cyan
            Write-Host ""
            
            # Run quick start
            & "$PSScriptRoot\quick-start.ps1"
            exit 0
        }
    } catch {
        # Docker not found or not running
    }
    
    $attempt++
    if ($attempt -lt $maxAttempts) {
        Write-Host "⏳ Waiting for Docker... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
        Write-Host "   Please install Docker Desktop and start it, then this script will continue automatically" -ForegroundColor Gray
        Start-Sleep -Seconds 10
    }
}

Write-Host ""
Write-Host "❌ Docker not detected after $maxAttempts attempts" -ForegroundColor Red
Write-Host ""
Write-Host "Please install Docker Desktop manually:" -ForegroundColor Yellow
Write-Host "   1. Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
Write-Host "   2. Install and restart if needed" -ForegroundColor Cyan
Write-Host "   3. Start Docker Desktop" -ForegroundColor Cyan
Write-Host "   4. Run this script again: powershell -ExecutionPolicy Bypass -File scripts/quick-start.ps1" -ForegroundColor Cyan
Write-Host ""
exit 1



