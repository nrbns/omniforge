# 🗺️ OmniForge Roadmap (December Beta Focus)

This roadmap focuses on getting OmniForge to a **solid December beta** with a killer demo and a stable Business Engine.

---

## 🎯 Milestone 1 – Demo Rock Solid (DONE / POLISH)

**Goal:** Idea → Spec → Build → Preview works smoothly in demo mode.

- ✅ Demo mode (no API keys)
- ✅ Backend + frontend build cleanly (`npm run build`)
- ✅ Basic idea → spec → project → build pipeline
- ✅ Health checks and API docs
- ✅ Docker-based infra for local dev

**Polish (nice-to-have):**
- [ ] Add more example ideas / projects
- [ ] Improve build logs UX in dashboard

---

## 🎯 Milestone 2 – Redix v1 (In Progress)

**Goal:** Redix Idea Layer is visible and useful in the UI.

- ✅ Idea storage with branches and commits
- ✅ RAG-enhanced IdeaParserAgent
- ✅ Qdrant + Neo4j wired into the backend

**Still to do:**
- [ ] UI for idea history (commits, branches)
- [ ] “Related ideas” / semantic search panel
- [ ] Basic KG visualization or relationship view

---

## 🎯 Milestone 3 – Business Engine v1 (Backend DONE, UX In Progress)

**Goal:** A single idea can produce not just an app, but a **business scaffold**.

**Backend (implemented):**
- ✅ `Business` model and API
- ✅ `CRM` + `Contact` + `Lead` + `SalesFunnel` models and APIs
- ✅ `MarketingAsset` model and API
- ✅ `Store` + `Product` + `Order` models and APIs
- ✅ `Workflow` + `WorkflowExecution` models and APIs
- ✅ Marketing/Sales/CRM/Store/Workflow agents in `packages/agents`

**Frontend / UX (to do):**
- [ ] Business overview dashboard (`/dashboard/business/[projectId]`)
- [ ] Marketing assets view (list + detail)
- [ ] CRM view (contacts + basic pipeline)
- [ ] Funnels view (list + basic stats)
- [ ] Store view (products + orders)
- [ ] Workflows list (status, last run)

---

## 🎯 Milestone 4 – Hosted Demo + Beta Flow

**Goal:** Anyone can try OmniForge without cloning the repo.

- [ ] Single-tenant hosted instance (e.g. Fly.io, Render, Railway, or self-host)
- [ ] “Try the demo” route with:
  - Pre-seeded ideas & projects
  - Safe, anonymous demo users
- [ ] Rate limiting + basic safety for demo
- [ ] Beta sign-up flow:
  - [ ] Simple landing page (could be powered by OmniForge itself)
  - [ ] Email capture for early access

---

## 🎯 Milestone 5 – December Public Beta

**Goal:** Announce OmniForge as an **ALPHA/BETA** and onboard early users.

- [ ] GitHub release: `v0.1.0-alpha`
- [ ] Polished README with:
  - Status / roadmap (this file)
  - Limitations / known issues
  - Demo GIFs / screenshots
- [ ] Blog post / launch doc:
  - “Idea → Business Engine” story
  - How OmniForge is different from Dualite / Cursor / etc.
- [ ] Initial Issues / Projects board with:
  - `good-first-issue`
  - `help-wanted`
  - `beta-feedback`

---

## 🧩 After December (Beyond Beta)

These are important but **not required** for a successful December beta:

- Multi-tenant SaaS + billing
- SSO / SAML and enterprise auth
- Fine-grained RBAC
- Advanced observability (metrics, tracing, structured logs)
- App packaging pipelines fully automated (iOS/Android store submission)

---

## ✅ How to Help

If you want to contribute to the beta:

- Pick an item from the milestones above
- Open an issue referencing the milestone
- Submit a PR with:
  - Clear description
  - Screenshots/GIFs where relevant
  - Tests where possible

OmniForge is meant to be the **world’s first AI Business Engine** – this roadmap is how we get there together.


