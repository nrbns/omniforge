# ✅ OmniForge Business Engine - UAT & Testing Guide

This guide describes how to validate the new **Business Engine** capabilities end-to-end:

- Business metadata
- Marketing assets
- Sales funnels
- CRM
- Store
- Workflows
- Leads

It assumes you are running the backend locally.

---

## 1. Environment Setup

### 1.1 Start services

From repo root:

```bash
cd apps/backend
npm install
npx prisma migrate dev
npm run dev
```

Backend will be available at:

- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`

---

## 2. Happy-Path UAT Flow (Idea → Project → Business → CRM → Marketing → Store → Workflows → Leads)

### 2.1 Create Idea

**Endpoint**
- `POST /api/ideas`

**Body (example)**
```json
{
  "userId": "demo-user",
  "title": "AI Fitness Coaching SaaS",
  "description": "AI-based fitness coaching platform with personalized plans",
  "rawInput": "I want to build an AI-powered fitness coaching SaaS..."
}
```

**Expected**
- `201 Created`
- Response contains `id` (ideaId) and `status: "DRAFT"`.

### 2.2 Parse Idea (Spec generation)

**Endpoint**
- `POST /api/ideas/{ideaId}/parse`

**Expected**
- `200 OK`
- Response has `status: "PARSED"` and `specJson` populated.
- Realtime event on `idea:{ideaId}` (if you have a WS client attached).

### 2.3 Create Project for Idea

**Endpoint**
- `POST /api/projects`

**Body (example)**
```json
{
  "ideaId": "<ideaId>",
  "userId": "demo-user",
  "name": "AI Fitness Coaching SaaS",
  "description": "Main project for AI fitness coaching business",
  "config": {}
}
```

**Expected**
- `201 Created`
- Response contains `id` (projectId) and relation to idea.

### 2.4 Upsert Business for Project

**Endpoint**
- `POST /api/business/{projectId}`

**Body (example)**
```json
{
  "businessType": "saas",
  "businessModel": "subscription",
  "targetAudience": {
    "segment": "fitness enthusiasts",
    "geo": "global"
  },
  "revenueModel": {
    "plans": [
      { "name": "Basic", "price": 29 },
      { "name": "Pro", "price": 59 }
    ]
  },
  "marketingStrategy": {
    "channels": ["content", "paid_social"],
    "budget": "low"
  },
  "competitiveAnalysis": {
    "competitors": ["Existing Fitness Apps"],
    "positioning": "AI-first personalization"
  }
}
```

**Expected**
- `200 OK`
- Response has `id` (businessId) and `project` relation.

### 2.5 Create CRM for Business

**Endpoint**
- `POST /api/crm`

**Body (example)**
```json
{
  "businessId": "<businessId>",
  "config": {
    "pipelines": ["New Lead", "Qualified", "Demo Scheduled", "Customer"]
  }
}
```

**Expected**
- `200 OK`
- Response includes CRM object with empty contacts/companies/deals.

### 2.6 Add Contact to CRM

**Endpoint**
- `POST /api/crm/contacts`

**Body (example)**
```json
{
  "crmId": "<crmId>",
  "email": "prospect@example.com",
  "firstName": "Alex",
  "lastName": "Strong",
  "source": "landing_page",
  "tags": ["trial"],
  "notes": "Requested demo"
}
```

**Expected**
- `201 Created`
- Contact returned, `crmId` matches.

### 2.7 Create Marketing Asset

**Endpoint**
- `POST /api/marketing`

**Body (example)**
```json
{
  "businessId": "<businessId>",
  "type": "landing_page",
  "title": "AI Fitness Coaching Landing Page",
  "content": {
    "headline": "Your AI Coach, 24/7",
    "subheadline": "Personalized workouts powered by AI",
    "sections": []
  },
  "platform": "web"
}
```

**Expected**
- `201 Created`
- Asset stored and visible via `GET /api/marketing/business/{businessId}`.

### 2.8 Create Sales Funnel

**Endpoint**
- `POST /api/sales/funnels`

**Body (example)**
```json
{
  "businessId": "<businessId>",
  "name": "Main SaaS Funnel",
  "description": "Landing → Trial → Paid",
  "stages": [
    { "name": "Visited Landing", "type": "awareness" },
    { "name": "Started Trial", "type": "consideration" },
    { "name": "Became Customer", "type": "purchase" }
  ]
}
```

**Expected**
- `201 Created`
- Funnel returned with `id`.

### 2.9 Create Store for Business

**Endpoint**
- `POST /api/store`

**Body (example)**
```json
{
  "businessId": "<businessId>",
  "name": "AI Fitness Store",
  "currency": "USD",
  "taxConfig": { "enabled": true },
  "shippingConfig": {},
  "paymentConfig": {
    "gateways": ["stripe"],
    "default": "stripe"
  }
}
```

**Expected**
- `200 OK`
- Store persisted, visible via `GET /api/store/business/{businessId}`.

### 2.10 Add Product to Store

**Endpoint**
- `POST /api/store/products`

**Body (example)**
```json
{
  "storeId": "<storeId>",
  "name": "Premium Coaching Plan",
  "description": "1:1 AI + human coach",
  "price": 99,
  "inventory": null,
  "images": [],
  "seo": {
    "title": "Premium AI Coaching",
    "description": "Upgrade your fitness journey"
  }
}
```

**Expected**
- `201 Created`
- Product appears in `GET /api/store/products/store/{storeId}`.

### 2.11 Create Workflow for Business

**Endpoint**
- `POST /api/workflows`

**Body (example)**
```json
{
  "businessId": "<businessId>",
  "name": "New Lead Welcome Sequence",
  "description": "Send welcome email to new leads",
  "trigger": {
    "type": "event",
    "event": "lead.created"
  },
  "steps": [
    { "id": "step1", "type": "email", "config": { "template": "welcome" } }
  ]
}
```

**Expected**
- `201 Created`
- Workflow visible in `GET /api/workflows/business/{businessId}`.

### 2.12 Create Lead (Public Endpoint)

**Endpoint**
- `POST /api/leads`

**Body (example)**
```json
{
  "email": "lead@example.com",
  "firstName": "Taylor",
  "source": "landing_page",
  "funnelId": "<funnelId>",
  "metadata": {
    "utm_source": "facebook_ads"
  }
}
```

**Expected**
- `201 Created`
- Lead appears in:
  - `GET /api/leads/funnel/{funnelId}`
  - `GET /api/leads/business/{businessId}` (through funnel)

---

## 3. Regression Checks

1. **Existing Idea & Project APIs**
   - Verify `ideas` and `projects` endpoints still behave as before:
     - `POST /api/ideas`
     - `GET /api/ideas`
     - `GET /api/ideas/{id}`
     - `POST /api/projects`
     - `GET /api/projects`

2. **Build & Deploy Flows**
   - Trigger build:
     - `POST /api/projects/{projectId}/builds`
   - Ensure builds still succeed and realtime events fire on `build:{buildId}`.

3. **Health & Docs**
   - `GET /api/health` returns `200 OK`.
   - Swagger UI shows new tags with correct schemas:
     - `business`, `marketing`, `sales`, `crm`, `store`, `workflows`, `leads`.

---

## 4. Automated Tests

### 4.1 Backend Jest Tests

From `apps/backend`:

```bash
cd apps/backend
npm test
```

**Expected**
- All Jest suites pass (current suite covers `IdeasController` through compiled JS tests in `dist`).

> Note: Additional Jest tests can be added for the new modules (`business`, `marketing`, `sales`, `crm`, `store`, `workflows`, `leads`) by following the existing controller-spec pattern.

---

## 5. UAT Acceptance Criteria

- You can go from **Idea → Project → Business** successfully with no errors.
- You can create and retrieve:
  - CRM + Contacts
  - Marketing assets
  - Sales funnels
  - Store + Products
  - Workflows
  - Leads
- Swagger UI shows all new endpoints with correct request/response schemas.
- Existing build/deploy flows continue to work without regression.

If all of the above pass, the Business Engine backend is considered **UAT-ready**.


