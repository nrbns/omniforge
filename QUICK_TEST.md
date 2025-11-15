# 🧪 Quick Test Guide - OmniForge Demo

## ✅ Pre-Flight Checklist

Before testing, ensure:
- [ ] Docker Desktop is running
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Ports 3000, 3001, 5432, 6379, 7474, 7687, 6333 are available

## 🚀 Quick Start Test

### 1. Setup Demo Environment

```bash
# Clone and setup
git clone https://github.com/nrbns/omniforge.git
cd omniforge
npm install

# Run demo setup (handles everything)
npm run demo:setup
```

### 2. Verify Services Are Running

Open in browser or use curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Should return:
# {"status":"ok","timestamp":"2024-..."}

# API Documentation
open http://localhost:3001/api/docs
# Or: curl http://localhost:3001/api/docs
```

### 3. Test Redix API - Create Idea

```bash
# Create an idea
curl -X POST http://localhost:3001/api/ideas \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "title": "Telemedicine App",
    "description": "A web app for remote medical consultations",
    "rawInput": "I want to build a telemedicine app that allows patients to book video consultations with doctors, manage prescriptions, and view medical records."
  }'

# Save the idea ID from response, e.g., "idea-id-123"
```

### 4. Test Idea Parsing

```bash
# Replace {ideaId} with actual ID from step 3
curl -X POST http://localhost:3001/api/ideas/{ideaId}/parse

# Get the parsed spec
curl http://localhost:3001/api/ideas/{ideaId}/spec

# Should return spec JSON with pages, dataModels, apis, etc.
```

### 5. Test Scaffold Generation

```bash
# Generate scaffold from idea
curl -X POST http://localhost:3001/api/scaffold/ideas/{ideaId}/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "telemedicine-app"
  }'

# Should return:
# {
#   "success": true,
#   "filePath": "...",
#   "filename": "telemedicine-app.tar.gz",
#   "downloadUrl": "/api/scaffold/download/telemedicine-app.tar.gz",
#   "message": "Scaffold generated successfully"
# }

# Download scaffold
curl -O http://localhost:3001/api/scaffold/download/telemedicine-app.tar.gz

# Extract and verify
tar -xzf telemedicine-app.tar.gz
cd telemedicine-app
ls -la
# Should see: package.json, app/, prisma/, etc.
```

### 6. Test Project Build Flow

```bash
# First, create a project from the idea
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "ideaId": "{ideaId}",
    "userId": "test-user-1",
    "name": "Telemedicine Project",
    "description": "Telemedicine app project"
  }'

# Save the project ID from response

# Start a build
curl -X POST http://localhost:3001/api/builds/projects/{projectId}

# Get build status
curl http://localhost:3001/api/builds/{buildId}

# Get build logs
curl http://localhost:3001/api/builds/{buildId}/logs

# Get build tasks
curl http://localhost:3001/api/builds/{buildId}/tasks

# Once build completes, download output
curl -O http://localhost:3001/api/builds/{buildId}/download
```

### 7. Test Frontend UI

Open in browser:
```
http://localhost:3000
```

Navigate to:
- Dashboard: `http://localhost:3000/dashboard`
- New Idea: `http://localhost:3000/dashboard/ideas/new`
- Search: `http://localhost:3000/dashboard/search`

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check Docker containers
docker ps

# Check logs
docker-compose logs

# Restart services
npm run docker:down
npm run docker:up
```

### Database Migration Errors

```bash
# Reset database
cd apps/backend
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
npx ts-node prisma/seed.ts
cd ../..
```

### Port Conflicts

```bash
# Check what's using ports
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Kill processes or change ports in docker-compose.yml
```

### Build Errors

```bash
# Check backend logs
cd apps/backend
npm run dev

# Check frontend logs
cd apps/frontend
npm run dev
```

## ✅ Success Criteria

All tests pass if:
- [x] Health check returns 200
- [x] Swagger UI loads at /api/docs
- [x] Idea creation returns idea with ID
- [x] Idea parsing returns spec JSON
- [x] Scaffold generation creates tar.gz file
- [x] Scaffold extraction shows Next.js project structure
- [x] Build creation returns build with ID
- [x] Build logs show agent execution steps
- [x] Frontend loads at localhost:3000
- [x] Dashboard shows ideas

## 📊 Expected Results

### Idea Creation Response
```json
{
  "id": "idea-...",
  "userId": "test-user-1",
  "title": "Telemedicine App",
  "description": "A web app for remote medical consultations",
  "status": "DRAFT",
  "createdAt": "2024-..."
}
```

### Spec Response
```json
{
  "id": "idea-...",
  "spec": {
    "version": "1.0.0",
    "name": "Telemedicine App",
    "pages": [...],
    "dataModels": [...],
    "apis": [...]
  },
  "status": "PARSED"
}
```

### Scaffold Generation Response
```json
{
  "success": true,
  "filePath": "...",
  "filename": "telemedicine-app.tar.gz",
  "downloadUrl": "/api/scaffold/download/telemedicine-app.tar.gz",
  "message": "Scaffold generated successfully"
}
```

### Build Response
```json
{
  "id": "build-...",
  "projectId": "project-...",
  "status": "RUNNING",
  "startedAt": "2024-...",
  "logs": [...]
}
```

## 🎉 You're Done!

If all tests pass, the demo is working correctly!

For more details, see:
- [AUDIT_IMPLEMENTATION_V2.md](./AUDIT_IMPLEMENTATION_V2.md)
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- [QUICKSTART.md](./QUICKSTART.md)

