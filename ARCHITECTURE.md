# OmniForge Architecture

> **The world's first open-source, end-to-end Idea → App → Deployment → App Store AI Builder**

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Core Services](#2-core-services)
3. [Experience Layer](#3-experience-layer)
4. [Data Model](#4-data-model)
5. [Core Flows](#5-core-flows)
6. [Unique Features](#6-unique-features)
7. [Implementation Priorities](#7-implementation-priorities)
8. [Technology Stack](#8-technology-stack)

---

## 1. System Overview

OmniForge is architected as **4 distinct layers** that work together to transform ideas into production-ready applications with built-in business capabilities.

```
┌─────────────────────────────────────────────────────────────┐
│                    EXPERIENCE LAYER                          │
│  Studio Dashboard | Generated Apps | Marketing Console       │
│                   | Public Playground                        │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      BRAIN LAYER                             │
│  Redix Idea Service | Multi-Agent Orchestrator | Model Adapters│
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    PLATFORM LAYER                            │
│  Project Service | UI Registry | CRM/Lead | Marketing      │
│  Auth | Billing | Tenant/Org                                │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    INFRA LAYER                               │
│  API Gateway | Job Queue | Databases | Storage | Deploy   │
│  Observability (logs, metrics, tracing)                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.1 Experience Layer (What Users See)

- **Studio / Admin Dashboard**: Main builder UI for creating and managing projects
- **Generated Apps**: Web/mobile applications produced by the system
- **Marketing & CRM Console**: Built-in business tools for each project
- **Public "Instant Demo" Playground**: Frictionless try-before-signup experience

### 1.2 Brain Layer (Redix + AI Agents)

- **Redix Idea Service**: Idea ingestion, versioning, knowledge graph, semantic search
- **Multi-Agent Orchestrator**: Coordinates all AI agents (planner, UI, backend, marketing, workflows, deploy)
- **Model Adapters**: Unified interface for OpenAI, Anthropic, Kimi, local models

### 1.3 Platform Layer (Core Services)

- **Project Service**: Manages repos, builds, deployments
- **UI Component Registry**: Organized component library
- **CRM/Lead Service**: Built-in customer relationship management
- **Marketing/Workflow Service**: Automation and campaign management
- **Auth, Billing, Tenant/Org**: Multi-tenancy and monetization

### 1.4 Infra Layer

- **API Gateway**: Unified entry point
- **Job Queue**: Redis + BullMQ for async processing
- **Databases**: Postgres (primary), Redis (cache), Vector DB (embeddings), Neo4j (knowledge graph)
- **Storage**: S3-compatible for assets
- **Deployment**: OmniDeploy/Vercel/Docker
- **Observability**: Structured logs, metrics, distributed tracing

---

## 2. Core Services

### 2.1 Redix Idea Service (Secret Weapon)

**Purpose**: Convert messy ideas → structured, versioned, reusable "business spec"

**Responsibilities**:

- Store **ideas**, **commits**, **branches** (Git-like versioning for ideas)
- Run **IdeaParserAgent** → produce canonical SPEC:
  - App type, pages, flows
  - Data models
  - APIs
  - Business layer (pricing, funnel, user personas)
  - Marketing requirements (landing pages, channels)
- Build **Knowledge Graph**:
  - Concepts (User, Appointment, Subscription, etc.)
  - Relationships (uses, depends_on, similar_to)
- Build **semantic search**: "Find apps similar to this idea"
- Provide version control: commit, branch, merge operations

**APIs**:

```
POST   /api/ideas                    # Create new idea
GET    /api/ideas/:id                 # Get idea details
GET    /api/ideas/:id/spec            # Get parsed spec
POST   /api/ideas/:id/commit          # Create new commit
POST   /api/ideas/:id/branch          # Create branch
POST   /api/ideas/:id/merge           # Merge branches
GET    /api/ideas/:id/history         # Get commit history
GET    /api/ideas/search?q=...        # Semantic search
GET    /api/ideas/:id/similar         # Find similar ideas
```

**Data Stores**:

- **Postgres**: Ideas, commits, branches, metadata
- **Neo4j**: Knowledge graph nodes/edges
- **Vector DB** (Qdrant/Milvus): Embeddings for semantic search

**Uniqueness**: No other builder has proper **idea version control + knowledge graph**

---

### 2.2 Agent Orchestrator Service

**Purpose**: Act like an internal engineering team, coordinating all AI agents

**Agents**:

1. **PlannerAgent**
   - Converts SPEC → ordered task graph
   - Determines dependencies between tasks
   - Outputs: UI tasks, backend tasks, marketing tasks, workflows, deploy tasks

2. **UIDesignerAgent**
   - Generates design tokens (colors, spacing, typography, shadows, radii)
   - Creates component variants
   - Designs page layouts
   - Optional Figma API integration

3. **FrontendAgent**
   - Generates Next.js/React + Tailwind pages/components
   - Uses SPEC + design tokens
   - Implements responsive layouts
   - Adds accessibility features

4. **BackendAgent**
   - Generates Prisma schema
   - Creates REST/GraphQL endpoints
   - Implements auth, roles, basic rules
   - Sets up realtime (WebSocket/SSE) channels

5. **MarketingAgent**
   - Generates landing page copy
   - Creates email sequences (MJML templates)
   - Writes blog posts
   - Generates ad copy (FB/Google/IG)
   - Creates social captions
   - Designs lead magnets (PDF outlines, checklists)

6. **WorkflowAgent**
   - Creates CRM pipelines
   - Defines automation rules (triggers + actions)
   - Implements basic lead scoring logic
   - Sets up n8n-like workflows

7. **TestAgent**
   - Generates Jest unit tests
   - Creates Playwright E2E tests for critical flows
   - Sets up test coverage reporting

8. **DeployAgent**
   - Sets up CI/CD config (GitHub Actions)
   - Triggers deployments
   - Manages preview/production environments

9. **PackageAgent**
   - Sets up mobile wrapper (Capacitor/React Native)
   - Generates Fastlane configs
   - Creates metadata files (app name, description, screenshots placeholders)

**Mechanics**:

- **Job Queue**: Redis + BullMQ
- Each job has: ID, type, status, logs, result payload
- Orchestrator sequences jobs based on Planner's task graph
- Emits events to WebSockets → frontend shows **live build timeline**
- Supports retries, error handling, parallel execution where possible

**APIs**:

```
POST   /api/agents/orchestrate       # Start agent orchestration
GET    /api/agents/jobs/:id          # Get job status
GET    /api/agents/jobs/:id/logs     # Stream job logs
POST   /api/agents/jobs/:id/retry    # Retry failed job
```

---

### 2.3 Project Service

**Purpose**: Owns the concept of a **Project** (a generated app + its environment)

**Responsibilities**:

- Create project from idea + commit
- Manage project settings (domain, env vars, secrets)
- Connect to Git repo (GitHub/GitLab) if user wants export
- Track builds and deployments
- Manage preview URLs
- Handle project lifecycle (create, update, archive, delete)

**APIs**:

```
POST   /api/projects                 # Create project from idea
GET    /api/projects                 # List projects (filtered by org/user)
GET    /api/projects/:id             # Get project details
PUT    /api/projects/:id              # Update project settings
DELETE /api/projects/:id             # Archive/delete project
POST   /api/projects/:id/build       # Trigger new build
GET    /api/projects/:id/builds      # List builds
GET    /api/builds/:id                # Get build details
GET    /api/builds/:id/logs          # Stream build logs
POST   /api/projects/:id/deploy       # Deploy (preview/prod)
GET    /api/projects/:id/deployments  # List deployments
```

**Entities**:

- Project (id, org_id, idea_id, idea_commit_id, name, status, repo_url, preview_url)
- Build (id, project_id, status, agent_steps_json, logs_url, started_at, completed_at)
- Deployment (id, project_id, env, status, url, created_at)

---

### 2.4 CRM & Lead Service (Built-in Business Layer)

**Purpose**: Turn each generated app into a **working business**

**Entities**:

- **Contacts**: People in the system
- **Leads**: Potential customers
- **Deals / Pipelines**: Sales opportunities
- **Companies**: Organizations (optional)
- **Events**: Page views, conversions, interactions

**Capabilities**:

- Auto-create **basic CRM schema** per project
- Lead forms / CTAs created on landing page
- Leads automatically flow to CRM
- Simple UI in Dashboard:
  - Leads table with filters
  - Pipeline stages (New → Qualified → Customer)
  - Contact detail view with timeline
- Lead scoring algorithm
- Integration with Supabase for contact storage

**APIs**:

```
POST   /api/crm                      # Create/update CRM for project
GET    /api/crm/business/:id         # Get CRM for business
POST   /api/crm/contacts              # Create contact
GET    /api/crm/contacts              # List contacts (with filters)
GET    /api/crm/contacts/:id         # Get contact details
PUT    /api/crm/contacts/:id         # Update contact
POST   /api/crm/leads/:id/score      # Calculate lead score
GET    /api/crm/leads/:id/scoring    # Get scoring breakdown
```

---

### 2.5 Marketing & Workflow Service

**Purpose**: Auto-generate and execute marketing + automation

**Responsibilities**:

- Store generated content:
  - Landing copy
  - Ad campaigns
  - Email templates (MJML)
  - Social media posts
- Manage **Workflows**:
  - Trigger types: "lead created", "purchase completed", "campaign started"
  - Actions: send email, call webhook, tag contact, create task, send WhatsApp/Telegram, schedule followup
- Integrations:
  - SendGrid/Mailgun for email
  - WhatsApp API (future)
  - Meta/Google Ads API (future)
- A/B testing framework
- Campaign analytics

**APIs**:

```
POST   /api/marketing                 # Create marketing asset
GET    /api/marketing/business/:id    # List marketing assets
POST   /api/workflows                 # Create workflow
GET    /api/workflows/business/:id    # List workflows
POST   /api/workflows/:id/execute    # Execute workflow
GET    /api/workflows/:id/monitoring # Get workflow stats
POST   /api/marketing/ab-tests        # Create A/B test
POST   /api/marketing/ab-tests/:id/assign # Assign variant
POST   /api/marketing/ab-tests/:id/conversion # Track conversion
```

---

### 2.6 UI Component Registry

**Purpose**: Keep all generated + curated components organized & reusable

**Component Schema**:

```typescript
{
  id: string;
  name: string;
  version: string;
  props_schema: JSONSchema;  // Type-safe props
  category: 'layout' | 'form' | 'display' | 'navigation' | 'feedback';
  source_path: string;        // File path in generated code
  preview_image?: string;
  tags: string[];
  dependencies: string[];      // Other component IDs
}
```

**Usage**:

- Builder UI (drag/drop)
- Agents (choose existing components instead of generating from scratch)
- Template marketplace (future)

**APIs**:

```
GET    /api/components                # List components (with filters)
GET    /api/components/:id            # Get component details
POST   /api/components                # Register new component
GET    /api/components/search?q=...   # Search components
```

---

## 3. Experience Layer

### 3.1 Studio / Admin Dashboard (Main App)

**Sections**:

1. **Home / Projects**
   - List of all projects
   - Status badges, last build time, preview link
   - Quick actions: Build, Deploy, Edit

2. **Ideas**
   - List of ideas with status
   - Button: "Convert idea → project"
   - View Redix spec + commit history
   - Search similar ideas

3. **Build Timeline**
   - Per-project pipeline visualization:
     * Planner → UI → Backend → Tests → Deploy → Marketing → Workflows → Package
   - Each step shows: logs, success/failure, retry button
   - Real-time updates via WebSocket

4. **Visual Editor / Studio**
   - Left: Pages & component tree
   - Center: Live preview (iframe)
   - Right: Inspector (props, data bindings, design tokens)
   - Bottom: Commit / publish area
   - Real-time collaboration (Yjs)

5. **Marketing & Funnels**
   - Landing page settings
   - Campaigns overview
   - A/B variants
   - Generated content list (emails, ads, posts)
   - Analytics dashboard

6. **Leads & CRM**
   - Leads table with filters
   - Pipeline/funnel view
   - Contact detail (timeline of events)
   - Lead scoring breakdown

7. **Automations**
   - Simple "if this then that" UI
   - Rule list with enable/disable
   - Examples:
     * If `lead.source = 'Landing'` → send welcome email + assign tag `MQL`
     * If `purchase.completed` → create deal + send receipt

8. **Settings**
   - Domains
   - Integrations (Stripe, PayPal, email provider)
   - App Store credentials
   - Billing & subscription

**Instant Feeling**: User can click **"New Idea → Build"** and see a **live preview** with functioning landing page and capture form in a single flow.

---

### 3.2 Generated Apps (Runtime)

Each project outputs:

- **Web App**
  - Next.js frontend
  - Pre-wired analytics events (page view, CTA clicks, forms)
  - Responsive design
  - SEO optimized

- **API Backend**
  - Auth (JWT)
  - CRUD for main models
  - Lead endpoints
  - Events endpoint
  - WebSocket support

- **Optional Mobile Wrapper**
  - React Native or Capacitor build
  - Targets iOS & Android
  - Fastlane configs included

These apps talk to Project APIs & CRM service.

---

### 3.3 Instant "Try It" Experience

**Public Playground** (no login required):

- Simple UI: "Describe your idea"
- Behind the scenes:
  * Call Redix with demo user
  * Run Planner + UI + Backend in "lite" mode
  * Show read-only live preview
- If user likes it → ask to sign up to save/export project

**Requirements**:

- "Demo tenant" isolation
- Time-limited or auto-cleanup of demo projects
- Rate limiting to prevent abuse

**Route**: `/playground` (public)

---

## 4. Data Model

### Core Tables

```sql
-- Users & Organizations
User(id, email, name, org_id, role, created_at)
Org(id, name, plan, settings_json, created_at)

-- Redix Idea Service
Idea(id, org_id, title, description, raw_input, created_by, current_commit_id, created_at)
IdeaCommit(id, idea_id, parent_ids[], author_id, spec_json, message, created_at)
IdeaBranch(id, idea_id, name, commit_id, created_at)

-- Projects & Builds
Project(id, org_id, idea_id, idea_commit_id, name, status, repo_url, preview_url, settings_json, created_at)
BuildJob(id, project_id, idea_commit_id, status, agent_steps_json, logs_url, started_at, completed_at, error_message)

-- CRM & Leads
Lead(id, project_id, email, name, status, source, score, meta_json, created_at)
Contact(id, lead_id, email, name, phone, company, tags[], created_at)
ContactEvent(id, lead_id, type, payload_json, created_at)
Deal(id, project_id, contact_id, name, value, stage, probability, created_at)

-- Marketing & Workflows
MarketingAsset(id, project_id, type, content_json, channel, status, created_at)
Workflow(id, project_id, trigger_type, condition_json, actions_json, is_enabled, created_at)
WorkflowExecution(id, workflow_id, status, input_json, output_json, started_at, completed_at)

-- Components
Component(id, name, version, props_schema_json, category, source_path, preview_image, tags[], created_at)

-- Deployments
Deployment(id, project_id, env, status, url, config_json, created_at)
AppStoreConfig(id, project_id, platform, credentials_ref, last_build_status, metadata_json)

-- Knowledge Graph (Neo4j)
Node(id, type, properties_json)
Edge(id, source_id, target_id, type, properties_json)
```

---

## 5. Core Flows

### 5.1 Idea → Real-time Project (Core Magic)

```
1. User enters idea in Studio
   ↓
2. Redix stores idea + runs IdeaParserAgent → SPEC
   ↓
3. User clicks "Create Project"
   ↓
4. PlannerAgent takes SPEC → task graph
   ↓
5. Agents run in order (with real-time updates):
   - UIDesigner → tokens/components
   - FrontendAgent → UI pages
   - BackendAgent → schema + APIs
   - TestAgent → tests
   - DeployAgent → preview env
   ↓
6. Studio shows build timeline with logs
   ↓
7. Once done → Preview opens live
```

### 5.2 Admin Editing UI Directly

```
1. Admin opens Studio → Project → Visual Editor
   ↓
2. Editor loads current UI + tokens
   ↓
3. Admin changes:
   - theme/colors
   - text copy (hero headline, CTA)
   - layout (swap component variant)
   ↓
4. Small changes → apply via HotPatch (no rebuild)
   ↓
5. Structural changes → Editor:
   - updates SPEC
   - creates new IdeaCommit
   - triggers PlannerAgent for partial rebuild
   ↓
6. After tests pass → Admin hits Publish
   ↓
7. DeployAgent uses CI to update preview/prod
```

### 5.3 Built-in Marketing & Lead Flows

```
1. After project build, MarketingAgent runs:
   - generates landing content
   - email welcome sequence
   - 3 social posts
   - 2 ad variants
   ↓
2. App's landing page includes lead capture form
   ↓
3. When lead submits:
   - LeadService stores record
   - WorkflowEngine triggers welcome email
   ↓
4. Admin sees:
   - new lead in CRM
   - open rate / click rates in Marketing tab
```

---

## 6. Unique Features

### 6.1 Redix Idea Graph

- Every idea + project is a node in knowledge graph
- Query: "show similar apps to this telemedicine idea"
- Reuse flows, components, patterns across projects
- Semantic search powered by vector embeddings

### 6.2 Business Engine Built-in

Always generate:
- App
- Landing page
- CRM
- At least one automation

**Tagline**: "AI builds a business, not just an app"

### 6.3 Full Pipeline Transparency (Build Timeline)

- Each agent = one visible step
- Logs, retries, metrics all visible
- Real-time WebSocket updates
- No black box - users see exactly what's happening

### 6.4 App Store Ready from Day 1

- Scaffolds & metadata files always generated
- Fastlane configs included
- Even if uploads are manual at first, structure is ready

### 6.5 Instant Playground (No Login)

- Match or beat "instant usage" feel of Dualite/Rocket
- Frictionless demo experience
- Auto-cleanup of demo projects

### 6.6 Template + Component Marketplace

- Architecture of Component Registry & Templates
- Future: community templates, paid bundles, vertical packs (fintech, healthcare, SaaS)

---

## 7. Implementation Priorities

### Phase 1: Idea → Project Core ✅

- [x] Redix SPEC
- [x] Planner + UI + Backend agents
- [x] Project + Build services
- [x] Preview deployment

### Phase 2: Studio (Admin Dashboard) MVP

- [x] Projects list
- [x] Build timeline
- [ ] Visual Editor (tokens + copy editing)
- [x] Preview

### Phase 3: CRM + Leads ✅

- [x] Lead model + APIs
- [x] Basic Leads page in Studio
- [x] Landing form wired to leads

### Phase 4: MarketingAgent + Workflows v1 ✅

- [x] Generate landing copy + welcome email
- [x] Simple rule: "On new lead → send email"
- [x] A/B testing framework

### Phase 5: Instant Playground

- [ ] Public "New Idea Demo" route
- [ ] Demo tenant + auto cleanup

### Phase 6: Packaging & App Store Scaffolds ✅

- [x] Generate Fastlane config + wrapper for each project
- [x] Docs + UI to show user how to run builds

### Phase 7: Knowledge Graph + Search

- [ ] Vector search + Neo4j graphs
- [ ] "Similar ideas/templates" suggestions in UI

---

## 8. Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS
- **State**: Zustand / React Query
- **Real-time**: Socket.io, Yjs (collaboration)
- **Charts**: Recharts
- **Editor**: Monaco Editor (code), Tiptap (rich text)
- **Animations**: Framer Motion

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **API**: REST + GraphQL (optional)
- **Real-time**: Socket.io, WebSockets
- **Job Queue**: BullMQ (Redis)

### Databases
- **Primary**: PostgreSQL (via Prisma)
- **Cache**: Redis
- **Vector DB**: Qdrant or Milvus
- **Graph DB**: Neo4j

### AI/ML
- **LLM Service**: Unified interface for OpenAI, Anthropic, HuggingFace
- **Embeddings**: OpenAI, HuggingFace
- **Local Models**: Ollama (optional)

### Infrastructure
- **Deployment**: Vercel (frontend), Railway/Render (backend), Docker
- **Storage**: S3-compatible (AWS S3, Cloudflare R2)
- **CDN**: Cloudflare
- **Monitoring**: Sentry, LogRocket
- **Analytics**: PostHog (self-hosted)

### Integrations
- **Payments**: Stripe, PayPal
- **Email**: SendGrid, Mailgun
- **Auth**: Clerk (or self-hosted)
- **Version Control**: GitHub API

---

## 9. Security & Compliance

### Authentication & Authorization
- JWT-based auth
- Role-based access control (RBAC)
- Multi-tenant isolation
- API key management

### Data Protection
- Encryption at rest
- Encryption in transit (TLS)
- PII handling compliance
- GDPR-ready features

### API Security
- Rate limiting
- CORS policies
- Input validation
- SQL injection prevention (Prisma)
- XSS protection

---

## 10. Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Job queue workers can scale independently
- Database read replicas

### Caching Strategy
- Redis for session data
- CDN for static assets
- Query result caching

### Performance
- Database indexing
- Lazy loading
- Code splitting
- Image optimization

---

## 11. Future Enhancements

1. **Multi-language Support**: Generate apps in multiple languages
2. **Advanced Analytics**: Custom dashboards, cohort analysis
3. **Marketplace**: Component and template marketplace
4. **White-label**: Allow users to white-label the builder
5. **Enterprise Features**: SSO, advanced RBAC, audit logs
6. **Mobile App Builder**: Native mobile app generation
7. **AI Chat Assistant**: Help users build better apps
8. **Version Control UI**: Visual Git-like interface for ideas

---

## 12. Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on contributing to OmniForge.

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0
