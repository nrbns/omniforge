# 🚀 OmniForge

<div align="center">

**The world's first open-source, end-to-end Idea → App → Deployment → App Store AI Builder**

**Powered by Hugging Face AI & Multi-Agent Orchestration**

[![Build Status](https://github.com/omniforge/omniforge/actions/workflows/build.yml/badge.svg)](https://github.com/omniforge/omniforge/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Powered-yellow)](https://huggingface.co)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

*Transform your ideas into production-ready apps with AI-powered agents, real-time collaboration, and one-click deployment.*

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## ✨ Features

### 🤖 **Hugging Face AI Integration**
- **AI-Powered Idea Parsing**: Uses Hugging Face models to intelligently extract app specifications from natural language
- **Semantic Search**: Vector embeddings for finding similar ideas across your repository
- **Code Generation**: AI-assisted code generation using StarCoder and Mistral models
- **Text Classification**: Categorize and understand ideas automatically

### 🔥 **Redix Idea Layer**
- **Idea Version Control**: Git-like versioning for ideas with commits, branches, and merges
- **Semantic Search**: Hugging Face-powered vector search across your idea repository
- **Knowledge Graph**: Neo4j-powered graph database for idea relationships
- **Real-time Collaboration**: Live presence, comments, and idea diffing

### 🤖 **Multi-Agent Build Engine** (Powered by Hugging Face)
- **PlannerAgent**: Uses AI to convert ideas into full application specifications
- **UIDesignerAgent**: Generates design tokens and Figma-compatible exports
- **FrontendAgent**: AI-powered Next.js/React/Tailwind code generation
- **BackendAgent**: Generates NestJS/FastAPI endpoints with Prisma schemas
- **RealtimeAgent**: Creates WebSocket endpoints and real-time features
- **TestAgent**: Generates Jest and Playwright tests
- **DeployAgent**: Sets up CI/CD with GitHub Actions, Vercel, Docker
- **PackageAgent**: Creates iOS/Android Fastlane configurations

### 🎨 **UI/UX System**
- **Design Tokens**: Centralized design system with colors, spacing, typography
- **Figma Integration**: Sync tokens with Figma for design workflows
- **Component Library**: Production-ready React components
- **Drag-Drop Builder**: Visual UI builder compatibility

### 📱 **Full-Stack Generation**
- **Web Apps**: Next.js with App Router, TypeScript, Tailwind CSS
- **Mobile Apps**: React Native / Capacitor wrappers
- **Backend APIs**: NestJS or FastAPI with Prisma ORM
- **Real-time**: WebSocket channels for live updates

### 🚀 **One-Click Deployment**
- **Web**: Deploy to Vercel, Netlify, or Docker
- **iOS**: Automated TestFlight uploads with Fastlane
- **Android**: Google Play Store automation
- **CI/CD**: GitHub Actions pipelines included

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL, Redis, Neo4j, Qdrant (or use Docker Compose)
- **Hugging Face API Key** (get one at [huggingface.co](https://huggingface.co))

### Installation

```bash
# Clone the repository
git clone https://github.com/omniforge/omniforge.git
cd omniforge

# Install dependencies
npm install

# Start infrastructure services
npm run docker:up

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env and add your HUGGINGFACE_API_KEY

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:3001/api`.

### Create Your First Idea

1. Sign up or sign in at `http://localhost:3000`
2. Click "New Idea" in the dashboard
3. Describe your app idea (e.g., "A telemedicine app for remote consultations")
4. Click "Parse Idea" - **Hugging Face AI will intelligently extract the specification**
5. Click "Build Project" - **AI agents will generate your code**
6. Deploy with one click!

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
