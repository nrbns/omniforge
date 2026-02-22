# OmniForge Real SaaS Builder — Architecture Blueprint

**Goal**: Prompt → Real UI → Live Preview → One-Click Deploy (Vercel/Firebase)

**Status**: Architecture design. Maps your spec to the existing codebase and defines implementation phases.

---

## Strategic Vision: Universal UI Interpreter

**Positioning**: *"Import any design. Turn it into a working app."*

OmniForge is **not** just an AI UI generator. It is a **Universal UI Interpreter**:

| Competitors | OmniForge |
|-------------|-----------|
| Generate UI from prompt only | **Import UI from anywhere** |
| Limited style, generic layout | **Figma, WordPress, Canva, prompt** → one schema |
| Output-only | **Convert → Enhance → Edit → Deploy** |

### Core Flow

1. **Import** design from tools (Figma, URL, image, prompt)
2. **Parse** into a unified layout schema
3. **Convert** to editable components
4. **Enhance** with UX intelligence (spacing, accessibility, responsive)
5. **Render** on canvas, edit visually
6. **Deploy** to Vercel/Firebase

### UI Sources (Ingestion Pipeline)

| Source | Flow | Extract |
|--------|------|---------|
| **Figma** | API → Frame → JSON → OmniForge layout | Layers, auto layout, typography, components |
| **WordPress / URL** | DOM scrape → Layout analysis → Component mapping | Navbar, sections, cards, buttons |
| **Canva / Image** | Vision model → Layout detection → UI components | Blocks, text hierarchy, colors, grids |
| **Prompt** | Traditional AI builder flow | Natural language → Layout spec |

### Unified Layout Schema (OmniForge Design Language)

Everything converts to one schema:

```ts
{
  type: "section",
  layout: "grid",
  children: [
    { type: "heading", props: { ... } },
    { type: "card", props: { ... } },
    { type: "button", props: { ... } }
  ]
}
```

### UX Intelligence Layer

Regardless of source, OmniForge adds:

- Normalized spacing (design tokens)
- Accessibility improvements
- Auto-responsive layout
- UX improvement suggestions (“CTA placement can improve conversion”)
- Multi-theme preview (light / dark / brand)
- Motion and animation suggestions

### Unique Workspace Feel

The **workspace** is premium and distinctive—not the imported UI itself:

- Smooth motion, glass panels, AI progress feedback
- Visual system map, interactive preview
- Workspace adapts; imported UI varies by user choice

### Implementation Order

| Phase | Scope |
|-------|-------|
| **Phase 1** | Prompt → Layout schema → Renderer (current MVP) |
| **Phase 2** | Figma import |
| **Phase 3** | Website / URL import |
| **Phase 4** | Image / Canva import |

### Differentiator vs Competitors

- **Cursor** → coding only  
- **v0** → UI generation only  
- **Lovable** → limited styles  

**OmniForge** → Universal design ingestion → editable → deployable app

### UI/UX Style Preferences (First-Class Input) ✅

UI is **not** an afterthought. Flow: `Idea + UI/UX preference → AppSpec → Layout → Code`

| Input | Options |
|-------|---------|
| **Visual style** | minimal, modern-saas, glassmorphism, neumorphism, bold-startup, luxury, playful, dark-first, material, ios |
| **Theme** | light, dark, auto |
| **Layout** | landing-page, dashboard, marketplace, e-commerce, etc. |
| **Interaction** | clean-static, animated, micro-interactions, gamified, conversion-focused |

- **Capture**: Idea form has "Customize your UI" — style cards + theme selector
- **Storage**: `uiPreferences` on Idea + AppSpec
- **Pipeline**: IdeaParserAgent merges preferences → UIDesignerAgent generates style-specific tokens → FrontendAgent applies style presets to components

---

## 1. Target User Journey

```
Step 1: Prompt        → User: "Build food delivery app"
Step 2: AI Generates  → Pages, Components, DB schema, API routes, real Next.js code
Step 3: Canvas        → Generated UI shown, editable drag-drop, code synced
Step 4: Preview       → Live running app inside OmniForge (actual runtime)
Step 5: Deploy        → One-click → Vercel or Firebase → live URL
```

---

## 2. Current vs Target State

### What You Already Have ✅

| Component | Location | Status |
|-----------|----------|--------|
| **Prompt input** | `ideas` API, dashboard | ✅ Idea creation + parsing |
| **Idea → Spec** | `idea-parser.service`, HuggingFace | ✅ AppSpec from natural language |
| **Code generation** | `FrontendAgent`, `ScaffoldGenerator` | ✅ Real Hero/Navbar/CTA/etc from spec |
| **Full project scaffold** | `scaffold-generator.ts` | ✅ app/, components/, lib/, package.json, etc. |
| **Monaco editor** | `RealtimeBuilder`, `SandboxEditor` | ✅ Code editing with Yjs sync |
| **Sandbox runtime** | `SandboxEditor` + WebContainer | ⚠️ RealtimeBuilder; Builder uses Sandpack |
| **Deploy pipeline** | `VercelService`, quick deploy API | ✅ Real Vercel API, live URL |
| **Workflow builder** | `WorkflowBuilder` (React Flow) | ✅ Trigger→Action automation |
| **Design tokens** | `UIDesignerAgent`, tokens API | ✅ Centralized design system |
| **Real-time collab** | Yjs, Socket.io, RealtimeGateway | ✅ Presence, doc sync |

### Remaining (Future)

| Component | Priority | Notes |
|-----------|----------|--------|
| **Real AI streaming** | P0 | Replace simulated chunks with LLM stream |
| **Page canvas** | P2 | Craft.js drag-drop (optional) |
| **GitHub auto repo** | P2 | Create repo, push, link Vercel |
| **Firebase deploy** | P2 | Mirror Vercel flow |

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           OmniForge Builder UI                                    │
├──────────────┬─────────────────────────────────────┬─────────────────────────────┤
│   LEFT       │            CENTER                    │          RIGHT              │
│   Panel      │            Panel                     │          Panel              │
├──────────────┼─────────────────────────────────────┼─────────────────────────────┤
│ • Pages tree │  ┌─────────────────────────────┐    │ • Properties (selected)     │
│ • Components │  │   CANVAS (Craft.js / DOM)   │    │ • AI Chat / Edit            │
│ • DB schema  │  │   or Sandpack iframe        │    │ • Token overrides           │
│ • AI prompt  │  │   Live preview of generated │    │ • Deploy config             │
│   input      │  │   Next.js app               │    │                             │
│              │  └─────────────────────────────┘    │                             │
├──────────────┴─────────────────────────────────────┴─────────────────────────────┤
│  BOTTOM: Logs | Build status | [▶ Preview] [🚀 Deploy to Vercel]                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Core Flow — Data Path

*See [Strategic Vision](#strategic-vision-universal-ui-interpreter) for multi-source ingestion (Figma, URL, Image).*

```
User prompt ("Build food delivery app")  — or Figma / URL / Image (future)
    │
    ▼
Idea Parser (HuggingFace / LLM) — or Figma/URL/Image Parser
    │
    ▼
AppSpec { pages, components, dataModels, apis }
    │
    ├──────────────────────────────────────────┐
    │                                          │
    ▼                                          ▼
FrontendAgent.generateFrontend()          UIDesignerAgent.generateTokens()
    │                                          │
    ▼                                          │
Real Next.js + Tailwind components             │
(Hero, CTA, Navbar, etc.)                      │
    │                                          │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
            ScaffoldGenerator / BuildProcessor
                   │
                   ▼
            output/{projectId}/
            ├── app/
            ├── components/
            ├── lib/
            ├── package.json
            ├── tailwind.config.js
            └── vercel.json
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
Sandpack     GitHub Push    Vercel API
Preview      (optional)     Deploy
```

---

## 5. Tech Stack (Aligned with Your Spec)

### Frontend (OmniForge UI)
- **Next.js 14** (App Router) — ✅ Already
- **Tailwind** — ✅ Already
- **Zustand** — ✅ builder-store (pages, layout, deploy, generatedFiles)
- **Framer Motion** — ✅ Already

### Canvas Engine
- **Option A: Sandpack** — Fastest MVP for live Next.js preview. No drag-drop initially.
- **Option B: Craft.js** — Full drag-drop canvas. More work, more powerful.
- **Option C: Hybrid** — Sandpack for preview + simple JSON layout editor (no Craft.js).

**Recommendation**: Start with **Sandpack** for live preview. Add Craft.js later if needed.

### AI Layer
- **Structured prompts** — ✅ Idea parser already uses spec extraction
- **JSON output** — ✅ AppSpec, PageSpec, ComponentSpec
- **Code generator** — ✅ FrontendAgent; needs LLM enhancement for component bodies
- **Multi-step pipeline** — ✅ PlannerAgent → UIDesigner → Frontend → Backend

### Backend
- **NestJS** — ✅ Already
- **Prisma + PostgreSQL** — ✅ Already
- **Supabase** — Optional for generated apps (as suggested in spec)

### Deployment
- **Vercel API** — `@vercel/sdk` or REST API
- **Firebase CLI / Admin SDK** — For Firebase hosting

---

## 6. Generated Project Structure (What AI Must Output)

Your `ScaffoldGenerator` and `FrontendAgent` already produce this. Ensure consistency:

```
generated-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Home
│   ├── globals.css
│   └── [other pages]/
│       └── page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── Hero.tsx
│   ├── Navbar.tsx
│   └── CTA.tsx
├── lib/
│   ├── utils.ts
│   └── api.ts
├── styles/
│   └── (if needed)
├── package.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── .env.example
└── vercel.json
```

**Critical**: `package.json` must have correct deps (next, react, tailwind) so `npm install && npm run build` works.

---

## 7. Live Preview Engine

### Current: WebContainer (SandboxEditor)
- Runs **single-file** TypeScript or Python
- Output: console logs
- **Not suitable** for full Next.js app preview

### Target: Sandpack
- **@codesandbox/sandpack-react**
- Supports Next.js template
- Renders actual React/Next.js in iframe
- Sync: code changes → Sandpack `files` prop → instant preview

### Integration

```tsx
// packages/editor or apps/frontend/src/components/LivePreview.tsx
import { Sandpack } from '@codesandbox/sandpack-react';

<Sandpack
  template="nextjs"
  files={{
    'app/page.tsx': { code: pageCode },
    'app/layout.tsx': { code: layoutCode },
    'components/Hero.tsx': { code: heroCode },
    // ... all generated files
  }}
  theme="dark"
  options={{ showNavigator: true, showTabs: true }}
/>
```

**Data source**: Build output from `output/{projectId}/` or in-memory files from `FrontendAgent`.

---

## 8. Deploy Engine (Vercel + Firebase)

### Vercel Flow

1. **Create GitHub repo** (optional): Use GitHub API or Octokit.
2. **Push generated files**: `git init`, `git add`, `git commit`, `git push`.
3. **Vercel API**:
   - `POST https://api.vercel.com/v13/deployments` with `gitSource` or `files`.
   - Or link project to GitHub and let Vercel auto-deploy on push.
4. **Return URL**: `https://{deployment}.vercel.app`

### Implementation

```typescript
// apps/backend/src/deployments/vercel.service.ts
import { Vercel } from '@vercel/sdk'; // or fetch

async deployToVercel(projectId: string, outputPath: string): Promise<{ url: string }> {
  // 1. Create tarball or zip of outputPath
  // 2. POST to Vercel with VERCEL_TOKEN
  // 3. Poll for deployment ready
  // 4. Return production URL
}
```

**Secrets**: `VERCEL_TOKEN`, `GITHUB_TOKEN` in backend `.env`.

### Firebase Flow

1. Generate `firebase.json` and `.firebaserc`.
2. Run `firebase deploy --only hosting` via child process or Firebase Admin.
3. Return hosting URL.

---

## 9. AI Component Generation (Real Code)

### Implemented ✅
`FrontendAgent.generateComponentCode()` now returns real JSX for Navbar, Hero, FeatureGrid, FeatureCard, CTA, Footer.

### Example
LLM should produce real components, e.g.:

```tsx
// Hero for "food delivery app"
export default function Hero() {
  return (
    <section className="py-20 text-center bg-gradient-to-r from-orange-500 to-red-500">
      <h1 className="text-4xl font-bold text-white">Food Delivery</h1>
      <p className="mt-4 text-white/90">Order your favorite meals in minutes</p>
      <button className="mt-6 px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100">
        Order Now
      </button>
    </section>
  );
}
```

### Implementation
- Use `LLMService` (or HuggingFace) in `FrontendAgent` with a structured prompt:
  - Input: `ComponentSpec { type, props }`, `PageSpec`, `AppSpec.name`
  - Output: Raw TSX string
- Fallback to template if LLM fails.
- Use `HallucinationDetectorService` to validate output.

---

## 10. Builder UI Layout (Figma + Cursor Style)

### Current RealtimeBuilder
- Left: Tabs (Code, Sandbox, Workflow, Popup, Ideas)
- Right: Ideas/Description
- No center canvas, no properties panel

### Target Layout

| Area | Content |
|------|---------|
| **Left** | Pages tree, Components list, DB schema view, Prompt input |
| **Center** | Canvas (Sandpack iframe) or Craft.js editor |
| **Right** | Properties panel (selected component), AI chat, Deploy config |
| **Bottom** | Build logs, Preview toggle, Deploy button |

### State (Zustand)

```typescript
// packages/editor or apps/frontend/src/stores/builder-store.ts
interface BuilderState {
  pages: PageSpec[];
  selectedPageId: string | null;
  selectedComponentId: string | null;
  canvasMode: 'preview' | 'edit';
  generatedFiles: Record<string, string>;
  buildStatus: 'idle' | 'building' | 'success' | 'error';
}
```

---

## 11. Phased Implementation Plan

### Phase 1: Core Loop — Prompt → Layout → Renderer (✅ Mostly Done)
**Goal**: Prompt → Real code → Live preview

- [x] **Builder layout** — Left/Center/Right/Bottom, Pages tree, Properties panel
- [x] **Sandpack** — LivePreview in /builder
- [x] **Unified schema** — LayoutNode, PageLayout, ComponentRenderer
- [x] **Vercel deploy** — API, progress, live URL
- [x] **Enhance FrontendAgent** — Real Hero/Navbar/FeatureGrid/CTA/Footer from spec

### Phase 2: Deploy & Polish (✅ Done)
- [x] Vercel API, deploy progress, toast
- [x] Dark theme, glass panels, agent pills

### Phase 3: Design Ingestion — Figma ✅
**Goal**: Figma → Parser → Unified Layout Schema

1. **Figma API** — Extract frames, layers, auto layout
2. **Figma → LayoutNode** — Map to OmniForge schema
3. **Import flow** — “Import from Figma” in builder

### Phase 4: Design Ingestion — Website / URL ✅
**Goal**: URL → DOM scrape → Layout analysis → Component mapping

1. **DOM parser** — Fetch URL, extract structure
2. **Component mapping** — Navbar, sections, cards → LayoutNode
3. **Import flow** — “Import from URL”

### Phase 5: Design Ingestion — Image / Canva ✅
**Goal**: Image → Vision model → Layout detection → UI components

1. **Vision API** — Detect blocks, text, colors, grids
2. **Layout inference** — Map to schema
3. **Import flow** — “Import from image”

### Phase 6: Canvas (Optional)
**Goal**: Drag-drop visual editing

1. **Craft.js** or custom canvas
2. **Sync**: Canvas edits → code → Sandpack

---

## 12. File Structure for New Code

```
omniforge/
├── apps/
│   ├── frontend/
│   │   └── src/
│   │       ├── app/
│   │       │   └── builder/           # Dedicated builder route
│   │       │       └── page.tsx
│   │       ├── components/
│   │       │   ├── builder/
│   │       │   │   ├── LivePreview.tsx
│   │       │   │   ├── BuilderLayout.tsx
│   │       │   │   ├── ImportModal.tsx  # Import from URL/Image/Figma
│   │       │   │   ├── PagesTree.tsx
│   │       │   │   ├── ComponentTree.tsx
│   │       │   │   └── PropertiesPanel.tsx
│   │       │   └── ...
│   │       └── stores/
│   │           └── builder-store.ts
│   └── backend/
│       └── src/
│           ├── import/                # Universal UI Import
│           │   ├── url-import.service.ts
│           │   ├── image-import.service.ts
│           │   ├── figma-import.service.ts
│           │   ├── import.controller.ts
│           │   └── import.module.ts
│           └── deployments/
│               ├── vercel.service.ts  # Real Vercel API
│               └── github.service.ts  # Optional: repo creation
├── packages/
│   └── editor/                        # Optional: Canvas engine
│       └── src/
│           ├── canvas/
│           └── components/
```

---

## 13. Challenges & Mitigations

| Challenge | Mitigation |
|-----------|------------|
| **LLM hallucination** | Use `HallucinationDetectorService`, fallback templates, component registry |
| **Dependency mismatch** | Pin versions in generated `package.json`, use known-good templates |
| **Build errors** | `ErrorRecoveryService`, retry with simplified output |
| **Preview performance** | Sandpack lazy-load, debounce code updates |
| **Deploy secrets** | Store `VERCEL_TOKEN` in env, never expose to frontend |

---

## 14. CTO Review & Execution Priorities

### Overall Verdict ✅

- Prompt → Spec → Code → Preview → Deploy loop correctly defined
- Uses existing OmniForge codebase
- Sandpack before Craft.js (smart MVP choice)
- Real deploy (not fake preview)
- **No conceptual flaws** — correct foundation for competing with real builders

### Strongest Parts

| Area | Why It Matters |
|------|----------------|
| **AppSpec pipeline** | Idea parser → AppSpec → agents is the moat. Enables consistency, multi-agent orchestration, visual architecture map, predictable generation. |
| **ScaffoldGenerator** | Produces real Next.js projects with full structure. Many tools generate fragments only. |
| **Deploy pipeline** | Mock replaced by real Vercel API. GitHub → Vercel → URL is industry standard. |
| **Sandpack-first preview** | Fast, stable, realistic. Reduces infra complexity. |

### Real Gaps to Address

| Gap | Status | Action |
|-----|--------|--------|
| **Component registry** | Partial — `packages/editor` has Navbar, Hero, FeatureGrid, etc. | Enforce: LLM must choose from registry or extend it. Canonical set: Hero, Navbar, FeatureGrid, Card, CTA, AuthForm. |
| **Layout schema layer** | ✅ Exists — AppSpec → LayoutNode/PageLayout → Code | Already: AppSpec → Layout JSON → Code via `layout-mapper`, `layoutToSandpackFiles`. Canvas uses this. |
| **Error recovery loop** | ✅ Done | `PreviewErrorBoundary`, `AIFixPanel`, `POST /api/builder/suggest-fix` |
| **Builder state orchestration** | ✅ Done | `generatedFiles`, `deployLogs`, `deployHistory`, `previewError` in store |

### AI Generation Strategy (Hybrid Approach)

Current: LLM generates component code directly.

**Upgrade to:**
1. LLM generates layout + component spec (types, props)
2. Registry templates used for structure
3. LLM fills template logic only (copy, links, etc.)

Benefits: reduces hallucination, speeds generation, improves consistency.

### Preview Architecture Improvement

**Current:** Sandpack loads from build output on disk.

**Done:** Keep generated files in memory. Zustand `generatedFiles` → Sandpack `files` prop.

Benefits: faster, reactive, easier editing, avoids FS complexity.

### Deploy Pipeline Improvements

- [x] **Async deploy status** — Progress bar, step logs (uploading → building → ready)
- [x] **Build logs panel** — Deploy tab in bottom panel
- [x] **Deployment history** — Last 10 deploys with links

### Builder UI Enhancements

| Area | Add |
|------|-----|
| **Left** | ✅ Pages, Components, File explorer, Architecture map |
| **Center** | ✅ Modes: canvas, preview, split, code |
| **Right** | ✅ Properties panel, AI fix panel (on error) |

### Most Powerful Differentiator: Visual Architecture Map

Show pages, API routes, DB schema, workflows in one "system brain view".

No competitor does this well. OmniForge’s edge.

### Refined Phase Plan (Execution Order)

| Phase | Scope | Timeline |
|-------|-------|----------|
| **Phase 1** | Improve FrontendAgent, enforce registry, in-memory file store, Sandpack integration | 2 weeks |
| **Phase 2** | Vercel deploy API, deploy UI + logs, error capture + retry | 1 week |
| **Phase 3** | Builder layout UI, Pages tree, Properties panel, Agent progress UI | 2 weeks |
| **Phase 4** | Craft.js canvas (optional drag-drop) | Future |

---

## 15. Success Criteria

- [x] User types "Build food delivery app" → AI produces real Next.js + Tailwind pages.
- [x] Live preview shows actual running app (Sandpack).
- [x] Deploy button → real Vercel URL returned.
- [x] Generated app builds successfully (`npm run build`).
- [x] One-click flow: Prompt → Preview → Deploy in under 5 minutes.
- [ ] **Generated app deploy success rate > 80%** — track and improve consistency.

---

## 16. References

- [AI Layer Architecture](./AI_LAYER_ARCHITECTURE.md) — AI as supportive teammate, 4 intelligences, feedback loop
- [Sandpack Next.js template](https://sandpack.codesandbox.io/docs/advanced-usage/templates#nextjs)
- [Vercel REST API](https://vercel.com/docs/rest-api)
- [Craft.js](https://craft.js.org/) (if adding canvas)
- Current: `packages/agents`, `apps/backend/src/agents`, `apps/frontend/src/components`

---

*Last updated: Feb 2025*
