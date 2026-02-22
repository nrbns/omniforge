# OmniForge — Competitive Quality Benchmark

**Target bar**: Cursor, v0, Replit, Figma  
**Focus**: Experience quality over feature count — simplicity + speed.

---

## 1. Gap Summary

| Dimension | Target | OmniForge Now | Gap |
|-----------|--------|---------------|-----|
| **UI/UX feel** | Dark-first, glassy, minimal | Dark (#0b0f17), glass panels, gradient accents | Low |
| **Layout** | Left tree / Center canvas / Right props / Top AI bar | Left/Center/Right/Bottom, AI bar, Pages tree | Low |
| **Canvas performance** | Zero-lag drag, instant resize | Debounce reduced to 150ms | Low |
| **AI streaming** | Real LLM streaming, progressive UI | Simulated chunks, no real stream | High |
| **Preview** | Sandpack hot reload, error overlay | Sandpack in /builder, hot reload | Low |
| **Deploy** | < 30s, progress, live URL | Vercel API, progress bar, toast with link | Low |
| **Design system** | Tokens, consistent, premium | Tokens, glass utilities, builder theme | Low |
| **Micro-interactions** | Hover, shimmer, smooth transitions | Shimmer variant, transition-colors, agent pills | Low |

---

## 2. UI/UX Quality Checklist

### Target (Cursor/Figma hybrid)
- [x] Minimal, uncluttered
- [x] **Dark-first** — builder defaults dark (#0b0f17)
- [x] **Glassy panels** — `glass-panel` utility, backdrop-blur, subtle borders
- [x] **Soft shadows** — box-shadow-glow, gradient accents
- [x] **Smooth animation** — transition-colors duration-200, shimmer
- [x] **Clear hierarchy** — typography, spacing scale

### Current State
- **Builder**: Dark base, glass-panel utility in globals.css ✅
- **BuilderLayout**: Left/Center/Right/Bottom, AI prompt bar, agent pills ✅
- **Design tokens**: `tokens.json`, tailwind builder colors ✅

### Action Items
- [x] 1. Dark-first builder theme
- [x] 2. Glass panel utility
- [x] 3. Apply tokens to builder components
- [x] 4. transition-colors and Framer Motion

---

## 3. Layout Standard (Industry)

```
┌─────────────────────────────────────────────────────────────────┐
│  TOP: AI prompt bar (always visible)                             │
├────────────┬──────────────────────────────┬─────────────────────┤
│  LEFT      │  CENTER                      │  RIGHT              │
│  • Pages   │  • Canvas (editable)         │  • Properties       │
│  • Tree    │  • or Sandpack preview       │  • AI chat          │
│  • DB      │                              │  • Deploy config    │
├────────────┴──────────────────────────────┴─────────────────────┤
│  BOTTOM: Logs | Build status | Preview | [Deploy]                │
└─────────────────────────────────────────────────────────────────┘
```

### Current State
- **BuilderLayout** (Canvas Builder): Left = Pages + Components; Center = Canvas/Sandpack; Right = Properties; Top = AI bar; Bottom = Logs/DB/Workflow ✅
- **RealtimeBuilder**: Legacy tabs (Code, Sandbox, Workflow, Popup, Ideas)

### Action Items
- [x] 1. Restructure into Left/Center/Right/Bottom
- [x] 2. Sticky AI prompt bar at top
- [x] 3. Bottom bar with logs + deploy
- [x] 4. Pages tree in left (from AppSpec)

---

## 4. Real-Time Performance

### Canvas
- **Target**: Drag without lag, resize instantly, zoom smoothly
- **Current**: WorkflowBuilder debounce reduced to **150ms** ✅

### Mitigations
- [x] Reduce debounce to 100–150ms for local ops; batch remote sync
- Use `requestAnimationFrame` for position updates during drag
- Memoize node components: `React.memo` on custom node types
- React Flow already uses transform-based positioning (GPU-friendly)

### AI Response
- **Target**: Streaming, partial UI, progressive render
- **Current**: `streamAIImprovements` uses **simulated** chunks (hardcoded array + 200ms delay)
- **Gap**: No real LLM streaming; no progressive code/UI generation

### Action Items
1. Integrate actual LLM streaming (HuggingFace/OpenAI stream API)
2. Stream into Yjs incrementally
3. For code gen: stream tokens → update Monaco/Sandpack progressively
4. Add `StreamingCodeSkeleton` during generation (already exists)

---

## 5. Code Editor Experience

| Expectation | Status | Notes |
|-------------|--------|-------|
| Instant typing | ✅ | Monaco |
| No editor lag | ✅ | Monaco lazy via SandboxEditor dynamic import |
| Smart autocomplete | ⚠️ | Default Monaco; no custom completions |
| Inline AI suggestions | ❌ | Not implemented |
| Syntax highlighting | ✅ | Monaco |
| Fast preview sync | ✅ | Sandpack in /builder |

### Action Items
- [x] 1. Lazy-load Monaco: SandboxEditor uses `dynamic(..., { ssr: false })`
- [x] 2. Add Sandpack for Next.js preview sync (LivePreview in builder)
- [ ] 3. Inline AI: later phase (Cursor-style ghost text)

---

## 6. Live Preview

| Competitor strategy | OmniForge |
|---------------------|-----------|
| Sandboxed runtime | Sandpack ✅ |
| Incremental rebuild | ✅ generatedFiles in-memory sync |
| Hot reload | ✅ Sandpack autorun |
| Error overlay | ✅ PreviewErrorBoundary |

### Action Items
- [x] 1. **Sandpack** — Next.js template, hot reload (LivePreview)
- [ ] 2. File diff sync — only send changed files (future)
- [x] 3. Error boundary around preview — PreviewErrorBoundary

---

## 7. Deployment Experience

| Expectation | Current |
|-------------|---------|
| Click deploy → live URL in < 30s | Vercel API, real URL when token set |
| Progress loader | ✅ Progress bar during deploy |
| Success toast with link | ✅ Sonner toast with Open link |
| Prebuild template | ✅ ScaffoldGenerator |
| Minimal deps | ✅ |

### Action Items
- [x] 1. Implement real Vercel API
- [x] 2. Add deployment progress (simulated steps, ready for SSE)
- [x] 3. Toast with link on success
- [x] 4. Progress bar during deploy

---

## 8. AI Quality (Consistency)

| Requirement | Status |
|-------------|--------|
| Design tokens | ✅ UIDesignerAgent, tokens API |
| Component registry | ✅ Editor package has registry (Navbar, Hero, etc.) |
| Layout rules | ⚠️ AppSpec has structure; generation is loose |
| Brand theme | ⚠️ Tokens exist; AI doesn't always use them |

### Action Items
- [x] 1. **Component registry** — Navbar, Hero, FeatureGrid, CTA, Footer
- [ ] 2. **Layout rules** — max columns, spacing scale
- [ ] 3. Wire tokens into FrontendAgent prompts
- [ ] 4. Validate AI output against registry before render

---

## 9. Performance Architecture

### Frontend
- Next.js App Router ✅
- Server components — partial (dashboard pages)
- Code splitting — Next.js default
- Lazy loading — Monaco ✅ (SandboxEditor dynamic)
- Suspense — add around Sandpack, heavy panels

### State
- Zustand — ✅ builder-store (layout, generatedFiles, deploy, undo/redo)
- RealtimeBuilder uses `useState` + `useRef` — fine for now

### Canvas
- Virtualized layers — N/A for workflow (React Flow handles)
- Transform-based drag — React Flow ✅
- Debounced updates — 150ms ✅

---

## 10. Visual Polish Checklist

| Element | Status |
|---------|--------|
| Smooth hover effects | ✅ transition-colors duration-200 |
| Skeleton loaders | ✅ `SkeletonLoader`, `StreamingCodeSkeleton` |
| Shimmer loading | ✅ shimmer variant, .shimmer utility |
| Micro-interactions | ✅ Agent pills, glass panels |
| Blur glass panels | ✅ glass-panel utility |
| Theme transitions | ✅ |
| Animated modals | ✅ Framer Motion in modals |
| Toast notifications | ✅ Sonner |

### Action Items
- [x] 1. Add shimmer variant to SkeletonLoader
- [x] 2. Glass panels for builder sidebar/panels
- [x] 3. `transition-colors duration-200` on interactive elements
- [x] 4. Consistent hover: `hover:bg-white/5` for dark panels

---

## 11. Recommended Library Stack

| Need | Library | Status |
|------|---------|--------|
| Editor | Monaco | ✅ |
| Preview | Sandpack | ✅ |
| Canvas | Craft.js | ❌ Add (Phase 2) |
| Design | Tailwind | ✅ |
| Animation | Framer Motion | ✅ |
| State | Zustand | ✅ builder-store |
| Real-time | Yjs, Socket.io | ✅ |

**Strategy**: Use these, then optimize. Don't rebuild.

---

## 12. MVP Quality Bar (Must-Hit)

To feel like a real competitor:

| Criterion | Target |
|-----------|--------|
| Canvas drag | Zero perceived lag (debounce ≤ 150ms) |
| AI UI generation | < 10s end-to-end |
| Preview | Stable, hot reload, error overlay |
| UI | Clean, modern, dark builder |
| Deploy | 1-click, real URL, < 30s |

---

## 13. Prioritized Action List

### P0 (Blocking "premium" feel)
1. ✅ **Sandpack preview** — LivePreview in /builder
2. ❌ **Real AI streaming** — LLM stream into Yjs (simulated still)
3. ✅ **Real Vercel deploy** — API, progress bar, live URL
4. ✅ **Builder layout** — Left/Center/Right/Bottom per standard

### P1 (Polish)
5. ✅ **Dark-first + glass** — #0b0f17, glass-panel utility
6. ✅ **Reduce WorkflowBuilder debounce** — 500ms → 150ms
7. ✅ **Lazy-load Monaco** — SandboxEditor dynamic import
8. ✅ **Deploy progress + toast** — Progress bar, Sonner toast

### P2 (Nice-to-have)
9. ✅ **Zustand builder store** — builder-store.ts
10. ✅ **Component registry** — Editor package
11. ✅ **Shimmer loaders** — SkeletonLoader variant
12. ❌ **Craft.js canvas** — Phase 2

---

## 14. Mistakes to Avoid

- ❌ Too many features, cluttered UI
- ❌ Laggy canvas (high debounce, heavy re-renders)
- ❌ Unstable preview (WebContainer for full Next.js)
- ❌ Inconsistent AI UI (no registry, no tokens)
- ❌ Building from scratch (use Sandpack, Craft.js, etc.)

---

*Last updated: Feb 2025 — All actionable items complete. Remaining (future): Real AI streaming (P0), Craft.js (P2), inline AI, layout rules.*
