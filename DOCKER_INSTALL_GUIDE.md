# 🐳 Docker Desktop Installation Guide for Windows

## Step 1: Download Docker Desktop

1. **Visit**: https://www.docker.com/products/docker-desktop/
2. Click **"Download for Windows"**
3. The installer will download: `Docker Desktop Installer.exe`

## Step 2: Install Docker Desktop

1. **Run the installer** (`Docker Desktop Installer.exe`)
2. **Enable WSL 2** if prompted (Docker Desktop requires WSL 2 on Windows)
3. **Complete the installation** and restart your computer when prompted
4. **Start Docker Desktop** from the Start menu

## Step 3: Verify Installation

After Docker Desktop is running, verify it works:

```powershell
# Check Docker version
docker --version

# Should output something like:
# Docker version 24.0.x, build ...

# Check Docker Compose
docker-compose --version

# Should output something like:
# Docker Compose version v2.x.x
```

## Step 4: Start Docker Desktop

1. Open Docker Desktop from Start menu
2. Wait for it to fully start (whale icon in system tray will be steady)
3. You should see "Docker Desktop is running" in the interface

## Step 5: Configure (Optional)

- Docker Desktop should work with default settings
- Make sure virtualization is enabled in BIOS if you get errors

---

**Once Docker is installed and running, I'll help you start the OmniForge project!**



