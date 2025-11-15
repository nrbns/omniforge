# 🏗️ OmniForge Architecture

This document provides a comprehensive overview of the OmniForge architecture, system design, and implementation details.

## Table of Contents

- [System Overview](#system-overview)
- [Layer Architecture](#layer-architecture)
- [AI & ML Integration](#ai--ml-integration)
- [RAG System](#rag-system)
- [Multi-LLM Support](#multi-llm-support)
- [Data Flow](#data-flow)
- [Component Details](#component-details)
- [Technology Stack](#technology-stack)
- [Deployment Architecture](#deployment-architecture)

---

## System Overview

OmniForge is a comprehensive monorepo-based system featuring:

1. **Frontend Application** (Next.js)
2. **Backend API** (NestJS)
3. **RAG System** (Retrieval-Augmented Generation)
4. **Multi-LLM Service** (OpenAI, Anthropic, Hugging Face)
5. **Vector Database** (Qdrant)
6. **Knowledge Base** (Template & Pattern Retrieval)
7. **Document Processing** (PDF, Images, Voice)
8. **Real-time Infrastructure** (WebSocket)
9. **Agent System** (Multi-agent orchestration)
10. **Performance & Code Review** (Quality assurance)

---

## AI & ML Integration

### **Multi-LLM Support**

OmniForge supports multiple LLM providers with automatic fallback:

1. **OpenAI** (GPT-4, GPT-3.5)
   - Primary for idea parsing and code generation
   - High-quality outputs

2. **Anthropic** (Claude)
   - Alternative with excellent reasoning
   - Long context windows

3. **Hugging Face** (Mistral, StarCoder)
   - Fallback provider
   - Open-source models
   - Cost-effective

### **RAG System (Retrieval-Augmented Generation)**

The RAG system enhances LLM responses with retrieved context:

```
User Query → Embedding → Vector Search → Retrieve Documents → LLM with Context → Enhanced Response
```

**Components**:
- **Vector Store**: Qdrant for document embeddings
- **Retrieval Service**: Hybrid search (vector + keyword)
- **Context Manager**: Manages context window and multi-step reasoning
- **RAG Service**: Orchestrates retrieval and generation

### **Vector Database**

- **Storage**: Qdrant for efficient vector similarity search
- **Embeddings**: Hugging Face sentence transformers
- **Collections**: Separate collections for ideas, templates, knowledge base

---

## Layer Architecture

### Layer A: **Redix Idea Layer** (Enhanced with RAG)

**Purpose**: Version control and knowledge management for ideas

**Components**:
- `IdeaParserAgent`: Uses RAG + LLM for intelligent parsing
- `CommitAgent`: Manages idea versioning
- `KGAgent`: Knowledge graph operations in Neo4j
- `SearchAgent`: Semantic search using vector embeddings

**Features**:
- **RAG-Enhanced Parsing**: Uses retrieved templates and knowledge
- **Multi-LLM Support**: Automatically selects best provider
- **Template Retrieval**: Finds similar app templates
- **Semantic Search**: Vector-based idea discovery

---

### Layer B: **Multi-Agent Build Engine** (Enhanced with AI)

**Purpose**: Generate application code from specifications

**Agents**:

1. **PlannerAgent** (RAG + LLM)
   - Input: Idea spec + retrieved templates
   - Output: Detailed application specification
   - Uses: RAG for template matching, LLM for planning

2. **UIDesignerAgent** (LLM)
   - Input: App spec + design requirements
   - Output: Design tokens and Figma exports
   - Uses: LLM for design generation

3. **FrontendAgent** (LLM + Code Review)
   - Input: Spec + design tokens
   - Output: Next.js pages and components
   - Uses: StarCoder/Mistral for code generation
   - Review: CodeReviewAgent for quality assurance

4. **BackendAgent** (LLM + Code Review)
   - Input: Spec data models and APIs
   - Output: Prisma schema + API endpoints
   - Uses: LLM for schema and endpoint generation
   - Review: CodeReviewAgent for security and best practices

5. **CodeReviewAgent** (NEW - LLM)
   - Input: Generated code
   - Output: Review with scores, issues, suggestions
   - Features: Security analysis, performance checks, best practices

6. **OptimizationAgent** (NEW - LLM)
   - Input: Code + review results
   - Output: Optimized code
   - Features: Performance optimization, bundle size reduction

7. **PerformanceAgent** (NEW - LLM)
   - Input: Code
   - Output: Performance analysis and monitoring code
   - Features: Complexity analysis, bottleneck detection

8. **TestAgent** (LLM)
   - Input: Generated code
   - Output: Jest unit tests + Playwright E2E tests

9. **DeployAgent** (Template-based)
   - Input: Platform selection
   - Output: CI/CD pipelines, Dockerfiles

10. **PackageAgent** (Template-based)
    - Input: Mobile platform
    - Output: Fastlane configurations

---

### Layer C: **Document Processing**

**Purpose**: Process various input formats for idea ingestion

**Processors**:
- **PDFProcessor**: Extract text, images, tables from PDFs
- **ImageProcessor**: OCR, image description, structured data extraction
- **VoiceProcessor**: Speech-to-text, speaker diarization, key points

**Integration**:
- Documents are processed and indexed in vector database
- Used as context for idea parsing

---

### Layer D: **Knowledge Base**

**Purpose**: Template and pattern retrieval system

**Features**:
- **Template Retrieval**: Find similar app templates
- **Pattern Matching**: Match ideas to known patterns
- **Best Practices**: Retrieve coding best practices
- **Examples**: Code examples and snippets

**Storage**:
- Vector database for semantic search
- Metadata filtering by category
- Usage tracking and ranking

---

### Layer E: **Context Management**

**Purpose**: Manage context windows for multi-step reasoning

**Features**:
- Context window management
- Document prioritization
- Conversation history management
- Entity extraction

---

## RAG System

### Architecture

```
┌─────────────┐
│ User Query  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Embedding Model │ (Hugging Face)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Vector Search   │ (Qdrant)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Document Filter │ (Metadata)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Reranking       │ (Optional)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Context Builder │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ LLM Generation  │ (Multi-provider)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Response        │
└─────────────────┘
```

### Collections

1. **omniforge**: Main ideas and documents
2. **knowledge_base**: Templates, patterns, best practices
3. **code_examples**: Code snippets and examples

---

## Multi-LLM Service

### Provider Selection

```typescript
1. Try primary provider (OpenAI)
2. If fails, try fallback (Anthropic)
3. If fails, try Hugging Face
4. If all fail, return error
```

### Usage Examples

```typescript
// Direct LLM call
const response = await llmService.generate(prompt, {
  provider: 'openai',
  temperature: 0.7,
  maxTokens: 2048,
});

// RAG-enhanced call
const response = await ragService.generate({
  query: 'Parse this idea...',
  retrievedDocs: [...],
});
```

---

## Data Flow

### Idea to App Flow (Enhanced)

```
1. User submits idea (text/voice/image/PDF)
   ↓
2. Document Processor extracts content
   ↓
3. Vector Store indexes idea
   ↓
4. Template Retrieval finds similar templates
   ↓
5. RAG System retrieves relevant context
   ↓
6. IdeaParserAgent (RAG + LLM) extracts spec
   ↓
7. Spec stored in PostgreSQL + Neo4j + Qdrant
   ↓
8. PlannerAgent expands spec with templates
   ↓
9. FrontendAgent generates code (LLM)
   ↓
10. CodeReviewAgent reviews code
    ↓
11. OptimizationAgent optimizes code
    ↓
12. PerformanceAgent analyzes performance
    ↓
13. Build process compiles code
    ↓
14. DeployAgent deploys to platform
    ↓
15. PackageAgent packages for app stores
```

---

## Technology Stack

### AI/ML
- **LLM**: OpenAI (GPT-4), Anthropic (Claude), Hugging Face (Mistral, StarCoder)
- **Embeddings**: Hugging Face Sentence Transformers
- **Vector DB**: Qdrant
- **RAG**: Custom RAG service

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL (Prisma)
- **Graph DB**: Neo4j
- **Cache**: Redis
- **Job Queue**: BullMQ
- **Real-time**: Socket.io

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS
- **State**: React hooks
- **Auth**: Clerk

---

## Deployment Architecture

### Development

```
┌─────────────┐
│   Next.js   │ → http://localhost:3000
└─────────────┘

┌─────────────┐
│   NestJS    │ → http://localhost:3001
└─────────────┘

┌─────────────┐
│  PostgreSQL │ → localhost:5432
│    Redis    │ → localhost:6379
│    Neo4j   │ → localhost:7687
│   Qdrant    │ → localhost:6333
└─────────────┘
```

### Production

```
┌─────────────────┐
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Next.js│ │ NestJS│
│(Vercel)│ │(K8s) │
└───────┘ └───┬───┘
              │
    ┌─────────┼─────────┐
    │         │         │
┌───▼──┐ ┌───▼──┐ ┌───▼──┐
│Postgres│ │ Redis │ │ Neo4j│
│        │ │       │ │      │
└────────┘ └───────┘ └──────┘
              │
         ┌────▼────┐
         │ Qdrant  │
         │ (Vector)│
         └─────────┘
```

---

## Performance Considerations

1. **Caching**: Redis for frequently accessed data
2. **Job Queue**: Asynchronous agent execution
3. **Vector Search**: Optimized Qdrant queries
4. **LLM Batching**: Batch similar requests
5. **Context Window**: Smart truncation
6. **CDN**: Static assets via CDN
7. **Code Splitting**: Next.js automatic splitting

---

## Security

1. **Authentication**: Clerk-based auth
2. **Authorization**: Role-based access control
3. **API Keys**: Secure environment variable storage
4. **Input Validation**: DTOs with validation
5. **SQL Injection**: Prisma ORM prevents injection
6. **Code Review**: AI-powered security checks
7. **Rate Limiting**: Job queue rate limiting

---

## Future Enhancements

1. **Fine-tuned Models**: Custom models for specific domains
2. **Active Learning**: Improve from user feedback
3. **Multi-modal RAG**: Images and code in context
4. **Collaborative Filtering**: Learn from user patterns
5. **Auto-scaling**: Dynamic resource allocation
6. **A/B Testing**: Compare agent outputs

---

This architecture makes OmniForge the most comprehensive AI-powered app builder available, combining RAG, multi-LLM support, document processing, and advanced agents for unparalleled code generation quality.
