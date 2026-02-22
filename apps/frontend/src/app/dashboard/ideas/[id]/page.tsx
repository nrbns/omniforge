'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Idea } from '@omniforge/shared';
import { useIdeaRealtimeDoc } from '../../../../hooks/useIdeaRealtimeDoc';

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [aiStreaming, setAiStreaming] = useState(false);
  const [liveDescription, setLiveDescription] = useState('');
  const [presenceData, setPresenceData] = useState<Map<string, { cursor?: { line: number; column: number }; selection?: { start: number; end: number } }>>(new Map());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time collaborative editing
  const { ytext, connected, users, sendPresence, triggerAIStream } = useIdeaRealtimeDoc({
    ideaId: id,
    userId: 'demo-user', // TODO: Get from auth
    initialContent: idea?.description || '',
    onContentChange: (content) => {
      setLiveDescription(content);
      // Debounced save to database
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveDescription(content);
      }, 2000); // Save after 2 seconds of inactivity
    },
    onPresenceUpdate: (userId, cursor, selection) => {
      setPresenceData((prev) => {
        const next = new Map(prev);
        if (cursor || selection) {
          next.set(userId, { cursor, selection });
        } else {
          next.delete(userId);
        }
        return next;
      });
    },
  });

  useEffect(() => {
    fetchIdea();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchIdea = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/ideas/${id}`);
      const data = await response.json();
      setIdea(data);
      setLiveDescription(data.description || '');
    } catch (error) {
      console.error('Error fetching idea:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDescription = async (description: string) => {
    try {
      await fetch(`http://localhost:3001/api/ideas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
    } catch (error) {
      console.error('Error saving description:', error);
    }
  };

  // Sync Yjs text with textarea and track cursor for presence
  useEffect(() => {
    if (!ytext) return;

    const textarea = document.getElementById('idea-description-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    // Update textarea when Yjs changes
    const updateTextarea = () => {
      const content = ytext.toString();
      if (textarea.value !== content) {
        const cursorPos = textarea.selectionStart;
        textarea.value = content;
        // Restore cursor position
        textarea.setSelectionRange(cursorPos, cursorPos);
      }
    };
    ytext.observe(updateTextarea);

    // Update Yjs when textarea changes
    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      const current = ytext.toString();
      if (target.value !== current) {
        ytext.delete(0, current.length);
        ytext.insert(0, target.value);
      }
    };
    textarea.addEventListener('input', handleInput);

    // Track cursor position for presence
    const handleSelectionChange = () => {
      const text = textarea.value;
      const cursorPos = textarea.selectionStart;
      const lines = text.substring(0, cursorPos).split('\n');
      const line = lines.length - 1;
      const column = lines[lines.length - 1].length;
      sendPresence({ line, column }, { start: textarea.selectionStart, end: textarea.selectionEnd });
    };
    textarea.addEventListener('keyup', handleSelectionChange);
    textarea.addEventListener('click', handleSelectionChange);
    textarea.addEventListener('select', handleSelectionChange);

    return () => {
      ytext.unobserve(updateTextarea);
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('keyup', handleSelectionChange);
      textarea.removeEventListener('click', handleSelectionChange);
      textarea.removeEventListener('select', handleSelectionChange);
    };
  }, [ytext, sendPresence]);

  const handleParse = async () => {
    setParsing(true);
    try {
      const response = await fetch(`http://localhost:3001/api/ideas/${id}/parse`, {
        method: 'POST',
      });
      const data = await response.json();
      setIdea(data);
    } catch (error) {
      console.error('Error parsing idea:', error);
    } finally {
      setParsing(false);
    }
  };

  const handleBuild = async () => {
    try {
      // Create project first
      const projectResponse = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: id,
          userId: 'temp', // TODO: Get from auth
          name: idea?.title || 'New Project',
        }),
      });
      const project = await projectResponse.json();

      // Build project
      await fetch(`http://localhost:3001/api/projects/${project.id}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      router.push(`/dashboard/projects/${project.id}`);
    } catch (error) {
      console.error('Error building project:', error);
    }
  };

  const handleAIStream = async () => {
    setAiStreaming(true);
    try {
      await triggerAIStream();
    } catch (error) {
      console.error('Error streaming AI improvements:', error);
    } finally {
      setAiStreaming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Idea not found</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{idea.title}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/builder?ideaId=${id}`)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  🎨 Canvas Builder
                </button>
                <button
                  onClick={() => router.push(`/realtime-builder?roomId=idea:${id}&ideaId=${id}&userId=demo-user`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  🔄 Realtime Builder
                </button>
                {idea.status === 'DRAFT' && (
                  <button
                    onClick={handleParse}
                    disabled={parsing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {parsing ? 'Parsing...' : 'Parse Idea'}
                  </button>
                )}
                {idea.status === 'PARSED' && (
                  <button
                    onClick={handleBuild}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Build Project
                  </button>
                )}
              </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Status</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    idea.status === 'PARSED'
                      ? 'bg-green-100 text-green-700'
                      : idea.status === 'BUILDING'
                      ? 'bg-blue-100 text-blue-700'
                      : idea.status === 'FAILED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {idea.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Branch: <span className="font-mono">{idea.branch}</span>
              </p>
            </div>

            {/* Description - Live Collaborative Editor */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <div className="flex items-center gap-3">
                  {connected && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Live
                    </span>
                  )}
                  {users.length > 1 && (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {users.slice(0, 3).map((userId) => (
                          <div
                            key={userId}
                            className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white"
                            title={userId}
                          >
                            {userId.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {users.length} {users.length === 1 ? 'user' : 'users'}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleAIStream}
                    disabled={aiStreaming}
                    className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {aiStreaming ? (
                      <>
                        <span className="animate-spin">⚡</span>
                        AI Writing...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        AI Improve
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="relative">
                <textarea
                  id="idea-description-editor"
                  className="w-full min-h-[200px] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  placeholder="Describe your idea... (changes sync in real-time with other users)"
                  defaultValue={liveDescription || idea?.description || ''}
                />
                {/* Presence indicators overlay (simplified - would need absolute positioning for real cursors) */}
                {Array.from(presenceData.entries()).map(([userId, data]) => (
                  <div
                    key={userId}
                    className="absolute top-2 right-2 text-xs text-gray-400 flex items-center gap-1"
                    style={{ display: data.cursor ? 'flex' : 'none' }}
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {userId}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Changes are saved automatically and synced in real-time • Click &quot;AI Improve&quot; to get AI suggestions
              </p>
            </div>

            {/* Raw Input */}
            {idea.rawInput && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Raw Input</h2>
                <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm text-gray-800">
                  {idea.rawInput}
                </pre>
              </div>
            )}

            {/* Spec */}
            {idea.specJson && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Specification</h2>
                <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm text-gray-800 max-h-96 overflow-y-auto">
                  {JSON.stringify(idea.specJson, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Information</h2>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(idea.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Updated</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(idea.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  Create Branch
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  View Commits
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  Export Spec
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

