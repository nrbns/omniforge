# 🚀 OmniForge Quick Start Guide

Get OmniForge running in **under 5 minutes**!

## ⚡ **Fastest Way (Demo Mode)**

Run OmniForge **without any API keys**:

```bash
# 1. Clone the repository
git clone https://github.com/nrbns/omniforge.git
cd omniforge

# 2. Install dependencies
npm install

# 3. Start infrastructure (PostgreSQL, Redis, Neo4j, Qdrant)
npm run docker:up

# 4. Wait for services to be healthy (~30 seconds)
# Check status: npm run docker:logs

# 5. Run database migrations
npm run db:migrate

# 6. Seed demo data (optional but recommended)
npm run db:seed

# 7. Start in demo mode (no API keys needed!)
npm run dev:demo
```

**That's it!** 

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- API Docs: http://localhost:3001/api/docs

## 🎯 **Create Your First Idea**

1. Open http://localhost:3000
2. Click "New Idea"
3. Enter: `"A task management app with kanban boards and team collaboration"`
4. Click "Parse Idea" → **AI will extract the specification** (demo mode)
5. Click "Build Project" → **Agents will generate code** (demo mode)

## 🔧 **With Real API Keys (Production Mode)**

If you have API keys, enable production mode:

1. Copy environment files:
```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

2. Add your API keys to `apps/backend/.env`:
```env
DEMO_MODE=false
HUGGINGFACE_API_KEY=hf_...
OPENAI_API_KEY=sk-...  # optional
```

3. Start normally:
```bash
npm run dev
```

## 📦 **Full Setup (One Command)**

For complete setup with seeding:

```bash
npm run setup
```

This runs:
- `npm install`
- `npm run docker:up`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`

## ✅ **Verify Installation**

Check that everything is working:

```bash
# Check Docker services
npm run docker:logs

# Check API health
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:3000
```

## 🎯 **Next Steps**

- Read [README.md](./README.md) for full documentation
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- See [examples/telemedicine-demo](./examples/telemedicine-demo) for a complete example
- Explore [API Docs](http://localhost:3001/api/docs) for API reference

## 🆘 **Troubleshooting**

### Services won't start
```bash
npm run docker:down
npm run docker:up
```

### Database connection error
```bash
npm run docker:logs postgres
# Wait for "database system is ready to accept connections"
```

### Port already in use
Change ports in `.env` files or stop conflicting services.

### Need help?
- Check [Issues](https://github.com/nrbns/omniforge/issues)
- Read [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**🎉 You're ready to build! Start creating ideas at http://localhost:3000**

