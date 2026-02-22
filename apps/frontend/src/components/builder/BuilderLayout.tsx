'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@omniforge/editor';
import { useBuilderStore } from '../../stores/builder-store';
import { LivePreview } from './LivePreview';
import { PagesTree } from './PagesTree';
import { ComponentTree } from './ComponentTree';
import { PropertiesPanel } from './PropertiesPanel';
import { ImportModal } from './ImportModal';
import { FileExplorer } from './FileExplorer';
import { ArchitectureMap } from './ArchitectureMap';
import { CodeEditorPanel } from './CodeEditorPanel';
import { AIFixPanel } from './AIFixPanel';
import { PreviewErrorBoundary } from './PreviewErrorBoundary';
import { toast } from 'sonner';
const SAMPLE_SPEC = {
  version: '1.0',
  name: 'Food Delivery App',
  description: 'A food delivery app',
  pages: [
    {
      id: 'home',
      name: 'Home',
      path: '/',
      components: [
        { id: 'nav-1', type: 'Navbar', props: { title: 'FoodDelivery', ctaLabel: 'Order Now' } },
        {
          id: 'hero-1',
          type: 'Hero',
          props: {
            title: 'Your favorite meals, delivered.',
            subtitle: 'Order from the best restaurants in town.',
            ctaLabel: 'Order Now',
          },
        },
        {
          id: 'fg-1',
          type: 'FeatureGrid',
          props: { title: 'Why choose us', columns: 3 },
          children: [
            { id: 'fc-1', type: 'FeatureCard', props: { icon: '🚀', title: 'Fast delivery', description: '30 min or less.' } },
            { id: 'fc-2', type: 'FeatureCard', props: { icon: '🍕', title: 'Fresh food', description: 'Quality meals.' } },
            { id: 'fc-3', type: 'FeatureCard', props: { icon: '💳', title: 'Easy payment', description: 'Secure checkout.' } },
          ],
        },
        { id: 'cta-1', type: 'CTA', props: { title: 'Ready to order?', buttonLabel: 'Get the App' } },
        { id: 'footer-1', type: 'Footer', props: { brand: 'FoodDelivery' } },
      ],
    },
  ],
  dataModels: [],
  apis: [],
  realtime: [],
  integrations: [],
  ui: { theme: 'light', primaryColor: '#3b82f6' },
  uiPreferences: { style: 'modern-saas', theme: 'light', layout: 'landing-page', interaction: 'clean-static' },
  generatedAt: new Date().toISOString(),
};

const AGENT_PILLS = [
  { id: 'design', label: 'DesignBot', icon: '✨', color: 'from-violet-500/20 to-purple-600/20 border-violet-500/30' },
  { id: 'dev', label: 'DevBot', icon: '⚡', color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30' },
  { id: 'db', label: 'DBBot', icon: '🗄️', color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30' },
  { id: 'work', label: 'WorkBot', icon: '🔄', color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30' },
];

export function BuilderLayout() {
  const {
    layout,
    viewMode,
    setViewMode,
    undo,
    redo,
    canUndo,
    canRedo,
    loadFromSpec,
    saveLayout,
    loadLayout,
    deployStatus,
    deployUrl,
    deployProgress,
    setDeployStatus,
    setDeployProgress,
    addDeployLog,
    clearDeployLogs,
    addDeployToHistory,
    deployLogs,
    deployHistory,
    buildStatus,
  } = useBuilderStore();

  const [aiPrompt, setAiPrompt] = useState('');
  const [bottomTab, setBottomTab] = useState<'logs' | 'db' | 'workflow' | 'deploy' | 'architecture'>('logs');
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    loadFromSpec(SAMPLE_SPEC);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeploy = async () => {
    setDeployStatus('deploying');
    setDeployProgress(0);
    clearDeployLogs();
    addDeployLog('Uploading...');

    const steps = [
      { p: 15, msg: 'Uploading files...' },
      { p: 35, msg: 'Building...' },
      { p: 60, msg: 'Deploying...' },
      { p: 85, msg: 'Finalizing...' },
    ];
    const timers = steps.map((s, i) => setTimeout(() => {
      setDeployProgress(s.p);
      addDeployLog(s.msg);
    }, (i + 1) * 1500));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/deployments/quick`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectName: 'omniforge-demo',
            layout: layout || {},
          }),
        }
      );
      const data = await res.json();
      timers.forEach(clearTimeout);
      setDeployProgress(100);
      addDeployLog('Deployment ready!');
      const url = data?.url || 'https://omniforge-demo.vercel.app';
      setDeployStatus('success', url);
      addDeployToHistory(url);
      toast.success('Deployed!', { description: url, action: { label: 'Open', onClick: () => window.open(url) } });
    } catch (e) {
      timers.forEach(clearTimeout);
      setDeployStatus('error');
      setDeployProgress(0);
      addDeployLog(`Error: ${e instanceof Error ? e.message : 'Deploy failed'}`);
      toast.error('Deploy failed');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0f17] text-white">
      {/* Top: AI prompt bar (sticky, glass) */}
      <header className="flex-shrink-0 glass-panel border-b border-white/[0.08]">
        <div className="flex items-center gap-4 px-4 py-2">
          <h1 className="text-lg font-semibold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            OmniForge Builder
          </h1>

          {/* AI prompt input */}
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe what you want to build..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors duration-200"
            />
          </div>

          {/* Agent pills */}
          <div className="flex items-center gap-2">
            {AGENT_PILLS.map((p) => (
              <span
                key={p.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${p.color} border backdrop-blur-sm transition-colors duration-200 hover:opacity-90 ${
                  buildStatus === 'building' ? 'shimmer' : ''
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </span>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ↩ Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ↪ Redo
            </button>
            <button
              onClick={saveLayout}
              className="px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              💾 Save
            </button>
            <button
              onClick={loadLayout}
              className="px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              📂 Load
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="px-2 py-1.5 text-sm bg-violet-600/30 border border-violet-500/50 rounded-lg hover:bg-violet-600/50 transition-colors duration-200"
            >
              📥 Import
            </button>
            <div className="flex gap-1 mx-1">
              {(['canvas', 'split', 'preview', 'code'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors duration-200 ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button
              onClick={handleDeploy}
              disabled={deployStatus === 'deploying'}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg font-medium disabled:opacity-50 transition-all duration-200 shadow-glow-cyan"
            >
              {deployStatus === 'deploying' ? 'Deploying...' : '🚀 Deploy to Vercel'}
            </button>
          </div>
        </div>

        <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(spec) => loadFromSpec(spec)}
      />

      {/* Deploy progress bar */}
        {deployStatus === 'deploying' && (
          <div className="h-1 bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${deployProgress}%` }}
            />
          </div>
        )}
      </header>

      {/* Main: Left | Center | Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: glass panel */}
        <aside className="w-56 flex-shrink-0 glass-panel border-r border-white/[0.08] flex flex-col overflow-y-auto">
          <PagesTree />
          <ComponentTree />
          <FileExplorer />
          <ArchitectureMap />
        </aside>

        {/* Center */}
        <main className="flex-1 overflow-auto bg-gray-900/50">
          {viewMode === 'canvas' && (
            <div className="p-4">
              <div
                className="bg-white rounded-lg shadow-xl overflow-hidden border border-white/10 transition-colors duration-200"
                onClick={() => useBuilderStore.getState().setSelectedNode(null)}
              >
                {layout && <Canvas layout={layout} />}
              </div>
            </div>
          )}
          {viewMode === 'preview' && (
            <div className="h-full">
              <PreviewErrorBoundary>
                <LivePreview layout={layout} />
              </PreviewErrorBoundary>
            </div>
          )}
          {viewMode === 'code' && (
            <div className="h-full bg-gray-900">
              <CodeEditorPanel />
            </div>
          )}
          {viewMode === 'split' && (
            <div className="grid grid-cols-2 h-full">
              <div className="overflow-auto p-4 border-r border-white/10">
                <div className="bg-white rounded-lg shadow overflow-hidden border border-white/10">
                  {layout && <Canvas layout={layout} />}
                </div>
              </div>
              <div className="min-h-0">
                <PreviewErrorBoundary>
                  <LivePreview layout={layout} />
                </PreviewErrorBoundary>
              </div>
            </div>
          )}
        </main>

        {/* Right: glass panel */}
        <aside className="w-64 flex-shrink-0 overflow-hidden glass-panel border-l border-white/[0.08] flex flex-col">
          <div className="flex-1 overflow-auto">
            <PropertiesPanel />
          </div>
          <AIFixPanel />
        </aside>
      </div>

      {/* Bottom: Logs | DB | Workflow */}
      <footer className="flex-shrink-0 glass-panel border-t border-white/[0.08]">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.08] overflow-x-auto">
          {(['logs', 'deploy', 'db', 'workflow', 'architecture'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setBottomTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors duration-200 ${
                bottomTab === tab ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'db' ? 'DB' : tab === 'architecture' ? 'Architecture' : tab}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-500">Prompt → JSON → Canvas → Preview → Deploy</span>
          {deployUrl && (
            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline text-xs"
            >
              {deployUrl}
            </a>
          )}
        </div>
        <div className="px-4 py-2 text-xs text-gray-400 min-h-[40px] max-h-32 overflow-y-auto">
          {bottomTab === 'logs' && (
            <div className="font-mono text-gray-500">
              Ready. Select a component to edit properties. Use AI prompt above to generate changes.
            </div>
          )}
          {bottomTab === 'deploy' && (
            <div className="space-y-1">
              {deployLogs.length > 0 ? (
                deployLogs.map((log, i) => <div key={i} className="font-mono">{log}</div>)
              ) : (
                <div>No deploy logs yet.</div>
              )}
              {deployHistory.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="font-medium text-gray-300 mb-1">History</div>
                  {deployHistory.map((d, i) => (
                    <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="block text-cyan-400 hover:underline truncate">
                      {d.url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          {bottomTab === 'db' && (
            <div className="text-gray-500">No data models yet. Add models from AppSpec or AI.</div>
          )}
          {bottomTab === 'workflow' && (
            <div className="text-gray-500">Workflow graph view coming in Phase 2.</div>
          )}
          {bottomTab === 'architecture' && (
            <div className="text-gray-500">Pages, components, APIs, DB — system brain view.</div>
          )}
        </div>
      </footer>
    </div>
  );
}
