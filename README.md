# 🚀 OmniForge

<div align="center">

## **Build startups from ideas with AI-powered agents**

**OmniForge turns ideas into production-ready apps, launch workflows, and growth guidance — all in one open-source platform.**

[![Build Status](https://github.com/omniforge/omniforge/actions/workflows/build.yml/badge.svg)](https://github.com/omniforge/omniforge/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Powered-yellow)](https://huggingface.co)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

*Transform ideas into real apps with multi-agent AI, real-time collaboration, and one-click deployment.*

[✨ What you can do today](#-what-you-can-do-today) • [⚡ Quick Start](#-quick-start) • [🏗 Architecture](#️-architecture) • [🤝 Contributing](#-contributing)

</div>

---

## ⭐ Why OmniForge Exists

Building a startup today is fragmented.

You need:

* design tools
* coding tools
* deployment tools
* collaboration tools
* marketing tools

And most founders struggle turning ideas into working products.

**OmniForge exists to reduce this friction.**

👉 It converts ideas into structured application specs
👉 Uses AI agents to generate full-stack apps
👉 Enables preview and deployment
👉 Guides founders through launch and growth

The goal is simple:
**Make building and launching products feel less lonely and more achievable.**

---

## ✨ What You Can Do Today

With OmniForge (Alpha), you can:

✅ Convert ideas into structured app specifications
✅ Generate full-stack scaffolds (Next.js, NestJS, Prisma)
✅ Explore multi-agent orchestration workflows
✅ Experiment with design tokens and UI components
✅ Run OmniForge locally with zero API keys (demo mode)
✅ Experience real-time collaboration foundations

OmniForge is still evolving — but the core idea → app pipeline is already explorable.

---

## 🔥 What Makes OmniForge Different

### 🤖 Multi-Agent AI Orchestration

Instead of a single AI response, OmniForge uses specialized agents for planning, design, frontend, backend, testing, deployment, and packaging.

### 🧠 Idea Version Control (Redix Layer)

Ideas behave like code:

* commits
* branches
* merges
* semantic search
* knowledge graph relationships

### 🚀 End-to-End Execution Flow

OmniForge connects:
👉 Idea → Specification → Code → Deployment → Launch workflows

This makes it more than an AI builder — it becomes a startup execution platform.

---

## 🎬 Example Flow

```
Idea → AI Agents → Application Spec → Code Scaffold → Preview → Deploy → Launch
```

---

## 📸 Demo & Screenshots

*(Add screenshots / GIFs here — builder UI, idea creation, preview, workflow builder)*

---

## 🧭 Project Status

OmniForge is currently **ALPHA** and evolving rapidly.

### ✅ Implemented

* Idea ingestion and parsing
* Multi-agent orchestration pipeline
* Next.js frontend + NestJS backend
* Design tokens and component library
* Dockerized infrastructure
* Demo mode (no API keys required)

### 🚧 In Progress

* Real-time collaboration UX
* Deployment flows and packaging automation
* Business Engine (CRM, workflows, store)
* Visual builder integration

### ❌ Not Yet

* Hosted SaaS environment
* Production-grade RBAC and compliance
* Marketplace ecosystem

For architecture and milestones, see [docs/REAL_SAAS_BUILDER_ARCHITECTURE.md](./docs/REAL_SAAS_BUILDER_ARCHITECTURE.md).

---

## 💡 Who OmniForge Is For

* Indie hackers exploring ideas
* Founders building MVPs
* Agencies prototyping products
* Open-source contributors interested in AI orchestration
* Teams experimenting with collaborative product design

---

## ⭐ Why Open Source

OmniForge is open-source because building the future of AI-assisted product creation requires community experimentation and collaboration.

We believe:
👉 ideas should be versioned
👉 AI workflows should be transparent
👉 product creation should be accessible

---

## 🚀 Quick Start

### ⚡ Recommended: Demo Mode (No API Keys Required)

The single fastest way to try OmniForge:

```bash
# Clone the repository
git clone https://github.com/nrbns/omniforge.git
cd omniforge

# Install dependencies
npm install


# Run demo setup (handles everything automatically)
npm run demo:setup
```

This will:
- ✅ Check prerequisites (Node.js, Docker)
- ✅ Start Docker services (PostgreSQL, Redis, Neo4j, Qdrant)
- ✅ Run database migrations
- ✅ Seed demo data
- ✅ Start backend (port 3001) and frontend (port 3000)

**Access the demo:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- API Docs: http://localhost:3001/api/docs

**Smoke test the API:**
```bash
# Health check
curl http://localhost:3001/api/health

# Create an idea
curl -X POST http://localhost:3001/api/ideas \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "title": "My App Idea",
    "rawInput": "I want to build a task management app"
  }'
```

For detailed testing instructions, see [QUICK_TEST.md](./QUICK_TEST.md).

### 🔧 Manual Setup (Advanced / Production)

For a step-by-step manual flow (including real API keys, custom env, and full setup), see:

- [QUICKSTART.md](./QUICKSTART.md)
- [INSTALL_AND_RUN.md](./INSTALL_AND_RUN.md)

---

## 📁 Project Structure

```
omniforge/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   │   ├── huggingface/    # Hugging Face AI service
│   │   │   ├── ideas/          # Idea management endpoints
│   │   │   ├── projects/       # Project management endpoints
│   │   │   ├── builds/         # Build tracking endpoints
│   │   │   ├── deployments/    # Deployment endpoints
│   │   │   ├── tokens/         # Design token endpoints
│   │   │   ├── realtime/       # WebSocket gateway
│   │   │   └── agents/         # Agent orchestration + processors
│   │   └── prisma/             # Database schema and migrations
│   └── frontend/         # Next.js frontend app
│       └── src/app/      # Next.js App Router pages
├── packages/
│   ├── shared/           # Shared types and constants
│   ├── ui/               # Reusable UI components
│   ├── redix/            # Redix Idea Layer (with HF integration)
│   └── agents/           # Multi-agent build engine (with HF integration)
├── design-tokens/        # Design token definitions
├── .github/workflows/    # CI/CD pipelines
└── docker-compose.yml    # Infrastructure services
```

---

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: NestJS, Prisma, PostgreSQL, Redis
- **AI**: Hugging Face Transformers API
- **Real-time**: Socket.io
- **Graph DB**: Neo4j
- **Vector DB**: Qdrant (with Hugging Face embeddings)
- **Job Queue**: BullMQ
- **Auth**: Clerk
- **CI/CD**: GitHub Actions
- **Packaging**: Fastlane (iOS/Android)

---

## 🤖 Hugging Face Integration

OmniForge uses Hugging Face models throughout the platform:

### **Idea Parsing**
- **Model**: Mistral-7B-Instruct
- **Purpose**: Extract structured specifications from natural language ideas
- **Features**: Understands context, extracts pages, APIs, data models

### **Code Generation**
- **Model**: StarCoder / StarCoderBase
- **Purpose**: Generate production-ready TypeScript/React code
- **Features**: Context-aware code completion, component generation

### **Semantic Search**
- **Model**: sentence-transformers/all-MiniLM-L6-v2
- **Purpose**: Vector embeddings for idea similarity search
- **Features**: Find related ideas, suggest improvements

### **Text Classification**
- **Models**: DistilBERT, RoBERTa
- **Purpose**: Categorize ideas, analyze sentiment
- **Features**: Auto-tagging, quality assessment

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Hugging Face** for amazing open-source AI models
- All contributors and the open-source community
- Inspired by the vision of making app development accessible to everyone

---

<div align="center">

**Made with ❤️ by the OmniForge team**

**Powered by 🤗 Hugging Face**

</div>
