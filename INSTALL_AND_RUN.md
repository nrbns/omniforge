# 🚀 Install Docker & Run OmniForge

## Current Status

I've opened the Docker Desktop download page in your browser!

## 📥 Installation Steps

### Step 1: Download Docker Desktop
1. **Browser should have opened** to https://www.docker.com/products/docker-desktop/
2. Click **"Download for Windows"**
3. Wait for `Docker Desktop Installer.exe` to download

### Step 2: Install Docker Desktop
1. **Run** `Docker Desktop Installer.exe`
2. **Enable WSL 2** when prompted (required for Docker on Windows)
3. **Complete installation**
4. **Restart your computer** if prompted

### Step 3: Start Docker Desktop
1. Open **Docker Desktop** from Start menu
2. Wait for it to fully start (whale icon in system tray)
3. You should see "Docker Desktop is running"

### Step 4: Verify Installation

Open PowerShell and run:

```powershell
docker --version
docker-compose --version
docker ps
```

All should work without errors.

### Step 5: Run OmniForge

Once Docker is running, use the quick start script:

```powershell
# Navigate to project
cd C:\Users\Nrb\omniforge

# Run quick start script
powershell -ExecutionPolicy Bypass -File scripts/quick-start.ps1
```

**OR** manually:

```powershell
# Start Docker services
npm run docker:up

# Wait for services (15 seconds)
Start-Sleep -Seconds 15

# Setup database
cd apps/backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ../..

# Start project
$env:DEMO_MODE="true"
npm run dev:demo
```

## ✅ What Will Happen

The quick start script will:
1. ✅ Check if Docker is installed and running
2. ✅ Start Docker services (PostgreSQL, Redis, Neo4j, Qdrant)
3. ✅ Run database migrations
4. ✅ Seed demo data
5. ✅ Start backend and frontend servers

## 🎯 After Setup

Once running, you'll have:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Docs**: http://localhost:3001/api/docs

## 🐛 Troubleshooting

### Docker won't start
- Make sure virtualization is enabled in BIOS
- Check Windows Features: Enable WSL 2 and Hyper-V

### Services won't start
- Make sure Docker Desktop is fully running
- Check ports aren't in use: 5432, 6379, 7474, 7687, 6333

### Migration errors
- Reset database: `cd apps/backend && npx prisma migrate reset`

## 📋 Files Created

I've created these helper files:
- `DOCKER_INSTALL_GUIDE.md` - Detailed Docker installation
- `scripts/check-docker.ps1` - Docker checker script
- `scripts/quick-start.ps1` - Automated setup script

---

**Once Docker is installed, let me know and I'll help you run the project!**





