# OmniForge AI Layer — Design Principles & Architecture

**Goal**: OmniForge AI should feel like a **supportive expert teammate** — developer, designer, strategist, debugger, and growth mentor — that helps users **succeed, not get stuck**.

---

## 1. Realistic AI Promise

| Don't Promise | Do Promise |
|---------------|------------|
| ❌ Perfect code always | ✅ Clear guidance when stuck |
| ❌ Fully automated success | ✅ Fix suggestions + iteration support |
| ❌ No errors ever | ✅ Confidence to continue |

**Positioning**: OmniForge AI is a **supportive expert teammate**, not a "magic builder".

---

## 2. Four Core Intelligences

### 🧠 Product Intelligence

**AI understands**: what the user wants, target audience, app purpose, monetization logic.

| Component | Location | Status |
|-----------|----------|--------|
| Idea → Spec | `IdeaParserAgent`, `AppSpec` | ✅ |
| Pages, data models, APIs | Parsed from idea | ✅ |
| UI preferences | `uiPreferences` on Idea + AppSpec | ✅ |

**Prevents**: Random UI or feature generation.

---

### 🎨 Design Intelligence

**AI applies**: chosen UI style, spacing, hierarchy, consistency, UX improvements, accessibility basics.

| Component | Location | Status |
|-----------|----------|--------|
| Design tokens | `UIDesignerAgent`, style presets | ✅ |
| Component registry | FrontendAgent component types | ✅ |
| UI preference system | style, theme, layout, interaction | ✅ |
| Style-specific generation | STYLE_PRESETS in FrontendAgent | ✅ |

---

### 💻 Engineering Intelligence

**AI generates**: clean components, avoids dependency conflicts, handles build errors, suggests fixes, allows editing.

| Component | Location | Status |
|-----------|----------|--------|
| Component generation | `FrontendAgent`, `ScaffoldGenerator` | ✅ |
| Template hybrid | LayoutNode → Sandpack files | ✅ |
| Error detection | `PreviewErrorBoundary` | ✅ |
| Fix suggestion | `AIFixPanel`, `POST /api/builder/suggest-fix` | ✅ |
| Error recovery loop | `ErrorRecoveryService`, `HallucinationDetectorService` | ✅ |
| Validation | Component registry, spec validation | ⚠️ Partial |

---

### 📈 Business & Growth Intelligence

**AI suggests**: pricing, ICP, marketing content, growth experiments, conversion improvements.

| Component | Location | Status |
|-----------|----------|--------|
| Business spec | `Business` model, `PlannedSpec` | ✅ |
| Marketing assets | `MarketingAgent`, `/api/marketing` | ✅ |
| CRM, store, workflows | Business engine | ✅ |
| **Launch Assistant** (unified) | — | ❌ Not yet unified |

**Differentiation**: Holistic startup guidance — rare vs competitors.

---

## 3. AI Feedback Loop

Target flow:

```
Generate → Preview → Detect issues → Suggest fixes → Improve
```

| Step | Implementation |
|------|----------------|
| Generate | FrontendAgent, ScaffoldGenerator |
| Preview | Sandpack `LivePreview`, `generatedFiles` sync |
| Detect | `PreviewErrorBoundary`, build logs |
| Suggest fixes | `AIFixPanel` + `suggest-fix` API |
| Improve | User applies fix → store update → re-preview |

**Gap**: Loop is manual (user clicks "Apply fix"). Automatic retry with suggested fix is not wired.

---

## 4. Agent Architecture

| Agent | Purpose | Location | Status |
|-------|---------|----------|--------|
| **PlannerAgent** | Idea → structured spec | `IdeaParserAgent` (Redix) | ✅ |
| **UIDesignerAgent** | Tokens, layout style | `packages/agents` | ✅ |
| **FrontendAgent** | UI components | `packages/agents` | ✅ |
| **BackendAgent** | DB, API | `ScaffoldGenerator`, build processor | ✅ |
| **FixAgent** | Error detection, fix suggestions | `ErrorRecoveryService`, `suggest-fix` API, `AIFixPanel` | ✅ |
| **LaunchAssistantAgent** | Business, marketing, growth guidance | MarketingAgent, Business, CRM — not unified | ❌ |

---

## 5. Making AI Feel Smarter (Without Bigger Models)

| Technique | Current | Target |
|-----------|---------|--------|
| **Context memory** | Idea, spec in session | + UI style, previous fixes, project history |
| **Structured outputs** | AppSpec, JSON parsers | ✅ |
| **Templates + LLM** | Hybrid (presets + props) | ✅ |
| **Explainability** | Minimal | Add "why" for suggestions |

---

## 6. UX Features for Perceived Intelligence

| Feature | Status | Notes |
|---------|--------|-------|
| Agent progress messages | ✅ | Deploy progress, build logs |
| Agent pills (DesignBot, DevBot, etc.) | ✅ | BuilderLayout |
| Suggestions panel | ✅ | AIFixPanel when error |
| Improvement tips | ⚠️ | Could add proactive hints |
| Inline code fixes | ✅ | suggest-fix applies to generatedFiles |
| Build error explanation | ⚠️ | Basic; could add LLM explanation |

---

## 7. User Experience Goals

Users should feel:

- *"I'm not alone building this"*
- *"AI understands my idea"*
- *"AI helps when I get stuck"*
- *"AI suggests next steps"*

---

## 8. Implementation Priorities

### P1 — Strengthen Fix Loop
- Wire `ErrorRecoveryService` into build/deploy pipeline
- Add "Explain this error" (LLM) to AIFixPanel
- Optional: auto-apply fix with confirmation

### P2 — Launch Assistant
- Unify MarketingAgent, Business, CRM into LaunchAssistantAgent
- Suggest: pricing, ICP, landing copy, growth experiments
- Expose as "Launch" tab or sidebar in builder

### P3 — Context & Explainability
- Pass project history into fix/improvement prompts
- Add "Why this suggestion?" for AI recommendations

### P4 — Proactive Guidance
- Improvement tips when preview loads (e.g., "Consider adding a CTA")
- Next-step suggestions after deploy

---

## 9. References

- `REAL_SAAS_BUILDER_ARCHITECTURE.md` — Builder, spec, deploy
- `COMPETITIVE_QUALITY_BENCHMARK.md` — Quality bar
- `apps/backend/src/agents/services/error-recovery.service.ts`
- `apps/frontend/src/components/builder/AIFixPanel.tsx`

---

*Last updated: Feb 2025*
