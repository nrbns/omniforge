'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

interface PageContent {
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    ctaUrl: string;
  };
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  footer: {
    copyright: string;
    links: Array<{ label: string; url: string }>;
  };
}

interface VisualEditorProps {
  projectId: string;
  userId: string;
  roomId: string;
}

export default function VisualEditor({ projectId, userId, roomId }: VisualEditorProps) {
  const [tokens, setTokens] = useState<DesignTokens | null>(null);
  const [content, setContent] = useState<PageContent | null>(null);
  const [activeTab, setActiveTab] = useState<'tokens' | 'content' | 'preview'>('tokens');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const ydocRef = useRef<Y.Doc>(new Y.Doc());
  const providerRef = useRef<WebsocketProvider>();

  useEffect(() => {
    // Load tokens and content
    loadProjectData();

    // Setup Yjs for real-time collaboration
    const ydoc = ydocRef.current;
    const provider = new WebsocketProvider('ws://localhost:3001', roomId, ydoc);
    providerRef.current = provider;

    // Offline persistence
    const indexeddb = new IndexeddbPersistence(roomId, ydoc);
    indexeddb.whenSynced.then(() => console.log('Loaded from IndexedDB'));

    // Sync tokens
    const yTokens = ydoc.getMap<DesignTokens>('tokens');
    yTokens.observe(() => {
      setTokens(yTokens.toJSON() as DesignTokens);
    });

    // Sync content
    const yContent = ydoc.getMap<PageContent>('content');
    yContent.observe(() => {
      setContent(yContent.toJSON() as PageContent);
    });

    // Initial load from Yjs
    if (yTokens.size > 0) {
      setTokens(yTokens.toJSON() as DesignTokens);
    }
    if (yContent.size > 0) {
      setContent(yContent.toJSON() as PageContent);
    }

    return () => {
      provider.destroy();
      indexeddb.destroy();
    };
  }, [roomId, projectId]);

  const loadProjectData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/tokens/project/${projectId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens || getDefaultTokens());
      } else {
        setTokens(getDefaultTokens());
      }

      // Load preview URL
      const projectResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/projects/${projectId}`,
      );
      if (projectResponse.ok) {
        const project = await projectResponse.json();
        setPreviewUrl(project.previewUrl || '');
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
      setTokens(getDefaultTokens());
    }
  };

  const getDefaultTokens = (): DesignTokens => ({
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
  });

  const updateTokens = (updates: Partial<DesignTokens>) => {
    if (!tokens) return;

    const newTokens = { ...tokens, ...updates };
    setTokens(newTokens);

    // Sync to Yjs
    const yTokens = ydocRef.current.getMap<DesignTokens>('tokens');
    ydocRef.current.transact(() => {
      Object.entries(newTokens).forEach(([key, value]) => {
        yTokens.set(key, value as any);
      });
    });

    // Save to backend
    saveTokens(newTokens);
  };

  const saveTokens = async (tokensToSave: DesignTokens) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/tokens/project/${projectId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokens: tokensToSave }),
        },
      );
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  };

  const updateContent = (updates: Partial<PageContent>) => {
    if (!content) return;

    const newContent = { ...content, ...updates };
    setContent(newContent);

    // Sync to Yjs
    const yContent = ydocRef.current.getMap<PageContent>('content');
    ydocRef.current.transact(() => {
      Object.entries(newContent).forEach(([key, value]) => {
        yContent.set(key, value as any);
      });
    });

    // Save to backend (via hot patch)
    hotPatchContent(newContent);
  };

  const hotPatchContent = async (contentToSave: PageContent) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/projects/${projectId}/hotpatch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: contentToSave }),
        },
      );

      if (response.ok) {
        toast.success('Changes applied live!');
      }
    } catch (error) {
      toast.error('Failed to apply changes');
    }
  };

  const publishChanges = async () => {
    try {
      // Create new commit
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/projects/${projectId}/commit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Visual editor changes',
            tokens,
            content,
          }),
        },
      );

      if (response.ok) {
        toast.success('Changes committed!');
      }
    } catch (error) {
      toast.error('Failed to commit changes');
    }
  };

  if (!tokens) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Pages & Component Tree */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h3 className="font-semibold mb-4">Pages</h3>
        <ul className="space-y-2">
          <li className="p-2 bg-purple-50 rounded cursor-pointer">Home</li>
          <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">About</li>
          <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">Contact</li>
        </ul>

        <h3 className="font-semibold mt-6 mb-4">Components</h3>
        <ul className="space-y-2">
          <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">Hero</li>
          <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">Features</li>
          <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">Footer</li>
        </ul>
      </div>

      {/* Center - Tabs & Preview */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 flex">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-4 py-2 ${activeTab === 'tokens' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
          >
            Design Tokens
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 ${activeTab === 'content' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 ${activeTab === 'preview' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
          >
            Preview
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'tokens' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Design Tokens</h2>

              {/* Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(tokens.colors).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1 capitalize">{key}</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) =>
                            updateTokens({
                              colors: { ...tokens.colors, [key]: e.target.value },
                            })
                          }
                          className="w-16 h-10 rounded border"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            updateTokens({
                              colors: { ...tokens.colors, [key]: e.target.value },
                            })
                          }
                          className="flex-1 px-3 py-2 border rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Typography</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Font Family</label>
                    <input
                      type="text"
                      value={tokens.typography.fontFamily}
                      onChange={(e) =>
                        updateTokens({
                          typography: { ...tokens.typography, fontFamily: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Font Sizes</label>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(tokens.typography.fontSize).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-xs text-gray-500 mb-1">{key}</label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) =>
                              updateTokens({
                                typography: {
                                  ...tokens.typography,
                                  fontSize: { ...tokens.typography.fontSize, [key]: e.target.value },
                                },
                              })
                            }
                            className="w-full px-3 py-2 border rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Spacing */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Spacing</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(tokens.spacing).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1">{key}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          updateTokens({
                            spacing: { ...tokens.spacing, [key]: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Content Editor</h2>

              {content && (
                <>
                  {/* Hero Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Headline</label>
                        <input
                          type="text"
                          value={content.hero.headline}
                          onChange={(e) =>
                            updateContent({
                              hero: { ...content.hero, headline: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Subheadline</label>
                        <textarea
                          value={content.hero.subheadline}
                          onChange={(e) =>
                            updateContent({
                              hero: { ...content.hero, subheadline: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border rounded"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">CTA Button Text</label>
                        <input
                          type="text"
                          value={content.hero.cta}
                          onChange={(e) =>
                            updateContent({
                              hero: { ...content.hero, cta: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">CTA URL</label>
                        <input
                          type="text"
                          value={content.hero.ctaUrl}
                          onChange={(e) =>
                            updateContent({
                              hero: { ...content.hero, ctaUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Features</h3>
                    <div className="space-y-4">
                      {content.features.map((feature, index) => (
                        <div key={index} className="p-4 border rounded">
                          <div className="mb-2">
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                              type="text"
                              value={feature.title}
                              onChange={(e) => {
                                const newFeatures = [...content.features];
                                newFeatures[index] = { ...feature, title: e.target.value };
                                updateContent({ features: newFeatures });
                              }}
                              className="w-full px-3 py-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                              value={feature.description}
                              onChange={(e) => {
                                const newFeatures = [...content.features];
                                newFeatures[index] = { ...feature, description: e.target.value };
                                updateContent({ features: newFeatures });
                              }}
                              className="w-full px-3 py-2 border rounded"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="h-full">
              {previewUrl ? (
                <iframe src={previewUrl} className="w-full h-full border rounded" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No preview available. Build the project first.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Inspector */}
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <h3 className="font-semibold mb-4">Inspector</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Selected Component</label>
            <div className="text-sm text-gray-600">Hero Section</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Props</label>
            <div className="text-xs text-gray-500 space-y-1">
              <div>variant: "default"</div>
              <div>size: "lg"</div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Bindings</label>
            <div className="text-xs text-gray-500">hero.headline</div>
          </div>
        </div>

        {/* Publish Button */}
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={publishChanges}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Publish Changes
          </button>
        </div>
      </div>
    </div>
  );
}

