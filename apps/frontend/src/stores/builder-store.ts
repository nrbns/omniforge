'use client';

import { create } from 'zustand';
import { appSpecToSingleLayout, layoutToSandpackFiles } from '@omniforge/editor';
import type { PageLayout, LayoutNode } from '@omniforge/editor';

const MAX_UNDO = 50;
const MAX_DEPLOY_HISTORY = 10;

interface BuilderState {
  // Layout
  layout: PageLayout | null;
  pages: Array<{ id: string; name: string; path: string }>;
  selectedPageId: string | null;
  selectedNodeId: string | null;

  // In-memory generated files (Zustand → Sandpack)
  generatedFiles: Record<string, string>;

  // Undo stack
  history: PageLayout[];
  historyIndex: number;

  // UI
  viewMode: 'canvas' | 'preview' | 'split' | 'code';
  buildStatus: 'idle' | 'building' | 'success' | 'error';
  deployStatus: 'idle' | 'deploying' | 'success' | 'error';
  deployUrl: string | null;
  deployProgress: number;
  deployLogs: string[];
  deployHistory: Array<{ url: string; date: string }>;
  previewError: string | null;

  // Actions
  setLayout: (layout: PageLayout | null) => void;
  setPages: (pages: Array<{ id: string; name: string; path: string }>) => void;
  setSelectedPage: (id: string | null) => void;
  setSelectedNode: (id: string | null) => void;
  setViewMode: (mode: BuilderState['viewMode']) => void;
  setBuildStatus: (status: BuilderState['buildStatus']) => void;
  setDeployStatus: (status: BuilderState['deployStatus'], url?: string) => void;
  setDeployProgress: (progress: number) => void;
  setPreviewError: (error: string | null) => void;
  addDeployLog: (log: string) => void;
  clearDeployLogs: () => void;
  addDeployToHistory: (url: string) => void;
  syncGeneratedFiles: () => void;

  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  loadFromSpec: (spec: Record<string, unknown>) => void;
  saveLayout: () => void;
  loadLayout: () => void;
}

function cloneLayout(layout: PageLayout): PageLayout {
  return JSON.parse(JSON.stringify(layout));
}

function findAndUpdateNode(nodes: LayoutNode[], nodeId: string, props: Record<string, unknown>): boolean {
  for (const node of nodes) {
    if (node.id === nodeId) {
      node.props = { ...(node.props || {}), ...props };
      return true;
    }
    if (node.children) {
      if (findAndUpdateNode(node.children, nodeId, props)) return true;
    }
  }
  return false;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  layout: null,
  pages: [],
  selectedPageId: null,
  selectedNodeId: null,
  history: [],
  historyIndex: -1,
  viewMode: 'canvas',
  buildStatus: 'idle',
  deployStatus: 'idle',
  deployUrl: null,
  deployProgress: 0,
  deployLogs: [],
  deployHistory: [],
  previewError: null,
  generatedFiles: {},

  setLayout: (layout) => {
    set({ layout });
    if (layout) {
      const files = layoutToSandpackFiles(layout);
      set({ generatedFiles: files });
    } else set({ generatedFiles: {} });
  },
  setPages: (pages) => set({ pages }),
  setSelectedPage: (selectedPageId) => set({ selectedPageId }),
  setSelectedNode: (selectedNodeId) => set({ selectedNodeId }),
  setViewMode: (viewMode) => set({ viewMode }),
  setBuildStatus: (buildStatus) => set({ buildStatus }),
  setDeployStatus: (status, url) =>
    set({
      deployStatus: status,
      deployUrl: url || null,
      deployProgress: status === 'success' ? 100 : 0,
    }),
  setDeployProgress: (deployProgress) => set({ deployProgress }),
  setPreviewError: (previewError) => set({ previewError }),
  addDeployLog: (log) => set((s) => ({ deployLogs: [...s.deployLogs, `[${new Date().toLocaleTimeString()}] ${log}`] })),
  clearDeployLogs: () => set({ deployLogs: [] }),
  addDeployToHistory: (url) =>
    set((s) => ({
      deployHistory: [{ url, date: new Date().toISOString() }, ...s.deployHistory].slice(0, MAX_DEPLOY_HISTORY),
    })),
  syncGeneratedFiles: () => {
    const { layout } = get();
    if (layout) set({ generatedFiles: layoutToSandpackFiles(layout) });
  },

  updateNodeProps: (nodeId, props) => {
    const { layout } = get();
    if (!layout) return;
    const next = cloneLayout(layout);
    findAndUpdateNode(next.children, nodeId, props);
    set({ layout: next, generatedFiles: layoutToSandpackFiles(next) });
  },

  pushHistory: () => {
    const { layout, history, historyIndex } = get();
    if (!layout) return;
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(cloneLayout(layout));
    if (nextHistory.length > MAX_UNDO) nextHistory.shift();
    set({ history: nextHistory, historyIndex: nextHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const nextLayout = cloneLayout(history[historyIndex - 1]);
    set({
      layout: nextLayout,
      historyIndex: historyIndex - 1,
      generatedFiles: layoutToSandpackFiles(nextLayout),
      previewError: null,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const nextLayout = cloneLayout(history[historyIndex + 1]);
    set({
      layout: nextLayout,
      historyIndex: historyIndex + 1,
      generatedFiles: layoutToSandpackFiles(nextLayout),
      previewError: null,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1 && get().history.length > 0,

  saveLayout: () => {
    const { layout } = get();
    if (!layout) return;
    try {
      localStorage.setItem('omniforge-builder-layout', JSON.stringify(layout));
    } catch {
      // localStorage may be full or disabled
    }
  },

  loadLayout: () => {
    try {
      const stored = localStorage.getItem('omniforge-builder-layout');
      if (stored) {
        const layout = JSON.parse(stored) as PageLayout;
        set({
          layout,
          history: [layout],
          historyIndex: 0,
          selectedNodeId: null,
        });
      }
    } catch {
      // Invalid JSON or localStorage disabled
    }
  },

  loadFromSpec: (spec: Record<string, unknown>) => {
    const layout = appSpecToSingleLayout(spec as unknown as Parameters<typeof appSpecToSingleLayout>[0]);
    const specPages = Array.isArray(spec.pages) ? spec.pages : [];
    const pages = specPages.map((p: { id?: string; name?: string; path?: string }, i: number) => ({
      id: p.id || `page-${i}`,
      name: p.name || 'Page',
      path: p.path || '/',
    }));
    if (pages.length === 0) pages.push({ id: 'home', name: 'Home', path: '/' });
    const files = layoutToSandpackFiles(layout);
    set({
      layout,
      pages,
      selectedPageId: pages[0]?.id || null,
      selectedNodeId: null,
      history: [cloneLayout(layout)],
      historyIndex: 0,
      generatedFiles: files,
      previewError: null,
    });
  },
}));
