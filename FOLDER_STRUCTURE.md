# OmniForge Folder Structure

This document outlines the complete folder structure for OmniForge, aligned with the architecture defined in `ARCHITECTURE.md`.

## Root Structure

```
omniforge/
├── apps/                          # Applications (monorepo apps)
│   ├── backend/                   # NestJS Backend API
│   ├── frontend/                  # Next.js Frontend
│   └── playground/                # Public instant demo (future)
├── packages/                      # Shared packages
│   ├── agents/                    # AI Agent implementations
│   ├── llm/                       # LLM service abstraction
│   ├── redix/                     # Redix Idea Service
│   ├── rag/                       # RAG (Retrieval Augmented Generation)
│   ├── knowledge-base/            # Knowledge base utilities
│   ├── document-processor/       # Document processing
│   ├── ui/                        # Shared UI components
│   ├── shared/                    # Shared types/utilities
│   └── cli/                       # CLI tools
├── design-tokens/                 # Design tokens (JSON)
├── templates/                     # Template definitions
├── examples/                      # Example apps/specs
├── tests/                         # E2E and load tests
├── scripts/                       # Build/deploy scripts
├── docs/                          # Documentation
└── [config files]                 # Root config files
```

---

## apps/backend/ (NestJS Backend)

```
apps/backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── agents/                     # Agent Orchestrator Service
│   │   ├── agents.module.ts
│   │   ├── agents.service.ts      # Main orchestrator
│   │   ├── agents.controller.ts
│   │   ├── workflow.controller.ts # Workflow generation API
│   │   ├── popup.controller.ts    # Popup generation API
│   │   └── processors/             # Job processors
│   │       ├── idea-parser.processor.ts
│   │       ├── build.processor.ts
│   │       └── deploy.processor.ts
│   │
│   ├── ideas/                      # Redix Idea Service
│   │   ├── ideas.module.ts
│   │   ├── ideas.service.ts       # Idea CRUD, commits, branches
│   │   ├── ideas.controller.ts
│   │   ├── idea-parser.service.ts # IdeaParserAgent integration
│   │   └── dto/
│   │       ├── create-idea.dto.ts
│   │       └── commit-idea.dto.ts
│   │
│   ├── projects/                   # Project Service
│   │   ├── projects.module.ts
│   │   ├── projects.service.ts     # Project lifecycle
│   │   ├── projects.controller.ts
│   │   └── dto/
│   │
│   ├── builds/                     # Build Management
│   │   ├── builds.module.ts
│   │   ├── builds.service.ts
│   │   └── builds.controller.ts
│   │
│   ├── deployments/                # Deployment Service
│   │   ├── deployments.module.ts
│   │   ├── deployments.service.ts
│   │   └── deployments.controller.ts
│   │
│   ├── crm/                        # CRM & Lead Service
│   │   ├── crm.module.ts
│   │   ├── crm.service.ts          # CRM operations
│   │   ├── crm.controller.ts
│   │   ├── lead-scoring.service.ts # Lead scoring algorithm
│   │   └── dto/
│   │
│   ├── leads/                      # Lead Management
│   │   ├── leads.module.ts
│   │   ├── leads.service.ts
│   │   └── leads.controller.ts
│   │
│   ├── marketing/                  # Marketing & Workflow Service
│   │   ├── marketing.module.ts
│   │   ├── marketing.service.ts    # Marketing assets
│   │   ├── marketing.controller.ts
│   │   ├── ab-testing.service.ts   # A/B testing
│   │   └── dto/
│   │
│   ├── workflows/                  # Workflow Engine
│   │   ├── workflows.module.ts
│   │   ├── workflows.service.ts
│   │   ├── workflows.controller.ts
│   │   ├── workflow-execution.service.ts
│   │   ├── workflow-monitoring.service.ts
│   │   └── dto/
│   │
│   ├── store/                      # E-Commerce Store Service
│   │   ├── store.module.ts
│   │   ├── store.service.ts
│   │   ├── store.controller.ts
│   │   ├── inventory.service.ts    # Inventory management
│   │   └── dto/
│   │
│   ├── analytics/                  # Analytics Service
│   │   ├── analytics.module.ts
│   │   ├── analytics.service.ts    # Unified analytics
│   │   └── analytics.controller.ts
│   │
│   ├── email/                      # Email Service
│   │   ├── email.module.ts
│   │   ├── email.service.ts        # SendGrid/Mailgun
│   │   └── email.controller.ts
│   │
│   ├── integrations/               # External Integrations
│   │   ├── stripe/
│   │   │   ├── stripe.module.ts
│   │   │   ├── stripe.service.ts
│   │   │   └── stripe.controller.ts
│   │   ├── paypal/
│   │   │   ├── paypal.module.ts
│   │   │   ├── paypal.service.ts
│   │   │   └── paypal.controller.ts
│   │   └── supabase/
│   │       ├── supabase-auth.module.ts
│   │       └── supabase-auth.service.ts
│   │
│   ├── webhooks/                   # Webhook Service
│   │   ├── webhooks.module.ts
│   │   ├── webhooks.service.ts
│   │   └── webhooks.controller.ts
│   │
│   ├── export/                     # Export/Interop Service
│   │   ├── export.module.ts
│   │   ├── export.service.ts       # Shopify/HubSpot export
│   │   ├── export.controller.ts
│   │   └── export-templates.service.ts
│   │
│   ├── tokens/                     # Design Tokens
│   │   ├── tokens.module.ts
│   │   ├── tokens.service.ts
│   │   └── tokens.controller.ts
│   │
│   ├── realtime/                   # Real-time Service
│   │   ├── realtime.module.ts
│   │   ├── realtime.service.ts
│   │   └── realtime.gateway.ts     # WebSocket gateway
│   │
│   ├── search/                     # Search Service
│   │   ├── search.module.ts
│   │   └── search.service.ts      # Semantic search
│   │
│   ├── neo4j/                      # Neo4j Integration
│   │   ├── neo4j.module.ts
│   │   └── neo4j.service.ts       # Knowledge graph
│   │
│   ├── redis/                      # Redis Integration
│   │   ├── redis.module.ts
│   │   └── redis.service.ts
│   │
│   ├── prisma/                     # Prisma ORM
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── huggingface/                # HuggingFace Integration
│   │   ├── huggingface.module.ts
│   │   └── huggingface.service.ts
│   │
│   ├── scaffold/                   # Code Scaffolding
│   │   ├── scaffold.module.ts
│   │   └── scaffold.service.ts
│   │
│   ├── business/                   # Business Logic
│   │   ├── business.module.ts
│   │   └── business.service.ts
│   │
│   ├── metrics/                    # Metrics Service
│   │   ├── metrics.module.ts
│   │   ├── metrics.service.ts
│   │   └── metrics.controller.ts
│   │
│   ├── billing/                    # Billing Service
│   │   ├── billing.module.ts
│   │   ├── billing.service.ts
│   │   └── billing.controller.ts
│   │
│   ├── health/                     # Health Checks
│   │   ├── health.module.ts
│   │   └── health.controller.ts
│   │
│   ├── common/                     # Common utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   │
│   └── tests/                      # Backend tests
│
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Migration files
│   └── seed.ts                     # Seed data
│
├── Dockerfile
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## apps/frontend/ (Next.js Frontend)

```
apps/frontend/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── dashboard/              # Studio Dashboard
│   │   │   ├── page.tsx            # Projects list
│   │   │   ├── projects/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Project detail
│   │   │   │       ├── editor/     # Visual Editor
│   │   │   │       └── build/      # Build timeline
│   │   │   ├── ideas/
│   │   │   │   ├── page.tsx        # Ideas list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Idea detail + spec
│   │   │   ├── marketing/          # Marketing console
│   │   │   │   ├── page.tsx
│   │   │   │   ├── campaigns/
│   │   │   │   └── analytics/
│   │   │   ├── crm/                # CRM console
│   │   │   │   ├── page.tsx        # Leads table
│   │   │   │   ├── leads/
│   │   │   │   └── pipelines/
│   │   │   ├── workflows/          # Automations
│   │   │   │   └── page.tsx
│   │   │   └── settings/           # Settings
│   │   │       ├── page.tsx
│   │   │       ├── integrations/
│   │   │       └── billing/
│   │   ├── playground/             # Public instant demo (future)
│   │   │   └── page.tsx
│   │   └── api/                    # API routes (if needed)
│   │
│   ├── components/                 # React Components
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── EditorLayout.tsx
│   │   ├── ideas/
│   │   │   ├── IdeaCard.tsx
│   │   │   ├── IdeaForm.tsx
│   │   │   └── IdeaSpecViewer.tsx
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   └── BuildTimeline.tsx
│   │   ├── editor/
│   │   │   ├── VisualEditor.tsx
│   │   │   ├── ComponentTree.tsx
│   │   │   ├── PropertyInspector.tsx
│   │   │   └── LivePreview.tsx
│   │   ├── crm/
│   │   │   ├── LeadsTable.tsx
│   │   │   ├── LeadDetail.tsx
│   │   │   ├── PipelineView.tsx
│   │   │   └── LeadScoring.tsx
│   │   ├── marketing/
│   │   │   ├── CampaignList.tsx
│   │   │   ├── EmailEditor.tsx
│   │   │   └── ABTestView.tsx
│   │   ├── workflows/
│   │   │   ├── WorkflowBuilder.tsx # React Flow
│   │   │   └── WorkflowMonitor.tsx
│   │   ├── analytics/
│   │   │   ├── UnifiedAnalyticsDashboard.tsx
│   │   │   ├── SalesFunnelChart.tsx
│   │   │   └── MetricsDashboard.tsx
│   │   ├── sandbox/
│   │   │   ├── SandboxEditor.tsx   # Code sandbox
│   │   │   ├── ResponsiveSandbox.tsx
│   │   │   └── MatplotlibChart.tsx
│   │   ├── popups/
│   │   │   ├── PopupBuilder.tsx
│   │   │   ├── ExitIntentPopup.tsx
│   │   │   └── CartAbandonmentPopup.tsx
│   │   ├── realtime/
│   │   │   └── RealtimeBuilder.tsx # Yjs collaboration
│   │   ├── onboarding/
│   │   │   └── OnboardingTour.tsx  # React Joyride
│   │   ├── ui/                     # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── SkeletonLoader.tsx
│   │   └── animations/
│   │       └── AgentStreamingAnimation.tsx
│   │
│   ├── hooks/                      # React Hooks
│   │   ├── useLocalStorage.ts
│   │   ├── useRealtime.ts
│   │   └── useWebSocket.ts
│   │
│   ├── utils/                      # Utilities
│   │   ├── api.ts                  # API client
│   │   └── PythonRunner.ts        # Pyodide runner
│   │
│   └── styles/                     # Global styles
│       └── globals.css
│
├── public/                          # Static assets
│   ├── images/
│   └── icons/
│
├── Dockerfile
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## packages/agents/ (AI Agents)

```
packages/agents/
├── src/
│   ├── index.ts                    # Public exports
│   │
│   ├── base-agent.ts               # Base agent class
│   │
│   ├── planner-agent.ts            # PlannerAgent
│   ├── ui-designer-agent.ts        # UIDesignerAgent
│   ├── frontend-agent.ts            # FrontendAgent
│   ├── backend-agent.ts             # BackendAgent
│   ├── marketing-agent.ts           # MarketingAgent
│   ├── workflow-agent.ts            # WorkflowAgent
│   ├── test-agent.ts               # TestAgent
│   ├── deploy-agent.ts              # DeployAgent
│   ├── package-agent.ts             # PackageAgent
│   │
│   ├── ecomm-agent.ts               # ECommAgent
│   ├── crm-agent.ts                 # CRMAgent
│   │
│   └── types/
│       ├── agent.types.ts
│       └── spec.types.ts
│
├── package.json
└── tsconfig.json
```

---

## packages/redix/ (Redix Idea Service)

```
packages/redix/
├── src/
│   ├── index.ts
│   │
│   ├── idea.service.ts              # Idea CRUD
│   ├── commit.service.ts             # Commit operations
│   ├── branch.service.ts             # Branch operations
│   ├── merge.service.ts              # Merge operations
│   ├── parser.service.ts             # IdeaParserAgent
│   ├── search.service.ts             # Semantic search
│   │
│   ├── knowledge-graph/
│   │   ├── graph.service.ts          # Neo4j operations
│   │   └── graph.types.ts
│   │
│   └── types/
│       ├── idea.types.ts
│       └── spec.types.ts
│
├── package.json
└── tsconfig.json
```

---

## packages/llm/ (LLM Service)

```
packages/llm/
├── src/
│   ├── index.ts
│   ├── llm.service.ts               # Unified LLM interface
│   ├── types.ts                     # LLM types
│   │
│   └── providers/
│       ├── openai.provider.ts
│       ├── anthropic.provider.ts
│       └── huggingface.provider.ts
│
├── package.json
└── tsconfig.json
```

---

## packages/ui/ (Shared UI Components)

```
packages/ui/
├── src/
│   ├── index.ts
│   │
│   ├── components/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── ...
│   │
│   └── tokens/
│       └── tokens.ts                # Design tokens
│
├── package.json
└── tsconfig.json
```

---

## Other Packages

```
packages/
├── rag/                             # RAG implementation
│   └── src/
│       ├── rag.service.ts
│       └── vector-store.service.ts
│
├── knowledge-base/                  # Knowledge base
│   └── src/
│       └── knowledge-base.service.ts
│
├── document-processor/               # Document processing
│   └── src/
│       └── processor.service.ts
│
├── shared/                          # Shared types/utils
│   └── src/
│       ├── types.ts
│       └── utils.ts
│
└── cli/                             # CLI tools
    └── src/
        └── index.ts
```

---

## Configuration Files

```
omniforge/
├── package.json                     # Root package.json (monorepo)
├── turbo.json                       # Turborepo config
├── tsconfig.base.json               # Base TypeScript config
├── tsconfig.json                    # Root tsconfig
├── .gitignore
├── .env.example
├── docker-compose.yml                # Local development
├── README.md
├── ARCHITECTURE.md                  # This architecture doc
├── FOLDER_STRUCTURE.md              # This file
└── CONTRIBUTING.md
```

---

## Design Tokens

```
design-tokens/
└── tokens.json                      # Design tokens (colors, spacing, etc.)
```

---

## Templates

```
templates/
├── marketplace-template.json        # Marketplace template
├── saas-template.json               # SaaS template
└── [more templates...]
```

---

## Examples

```
examples/
├── telemedicine-app/
│   ├── README.md
│   └── spec.json
├── ecommerce-app/
│   └── README.md
└── [more examples...]
```

---

## Tests

```
tests/
├── e2e/                             # Playwright E2E tests
│   ├── idea-to-deploy.spec.ts
│   ├── workflow-builder.spec.ts
│   └── popup-builder.spec.ts
│
└── load/                            # Load tests
    └── processor.js                 # Artillery.io processor
```

---

## Scripts

```
scripts/
├── scaffold-generator.ts            # Code generator
├── demo.sh                          # Demo script
└── [more scripts...]
```

---

## Documentation

```
docs/
├── internal/                        # Internal docs
│   ├── ALL_FIXES_SUMMARY.md
│   └── ...
└── [more docs...]
```

---

## Key Principles

1. **Monorepo Structure**: All apps and packages in one repo
2. **Shared Packages**: Common code in `packages/`
3. **Service Separation**: Each service in its own module
4. **Type Safety**: TypeScript throughout
5. **API-First**: Backend APIs, frontend consumes
6. **Real-time**: WebSocket support for live updates
7. **Scalable**: Easy to add new services/agents

---

**Last Updated**: 2025-01-XX

