'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';
import { io, Socket } from 'socket.io-client';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { debounce } from 'lodash';
import { toast } from 'sonner';

const SandboxEditor = dynamic(() => import('./SandboxEditor'), { ssr: false });
import WorkflowBuilder from './WorkflowBuilder';
import PopupBuilder from './PopupBuilder';
import { ResponsiveSandbox } from './ResponsiveSandbox';
import { AgentStreamingAnimation, AgentSwarm } from './AgentStreamingAnimation';

interface RealtimeBuilderProps {
  roomId: string;
  userId: string;
  ideaId?: string;
  projectId?: string;
  userName?: string;
  userColor?: string;
}

interface AwarenessUser {
  id: string;
  name: string;
  color: string;
  cursor?: { line: number; column: number };
  selection?: { start: number; end: number };
}

export default function RealtimeBuilder({
  roomId,
  userId,
  ideaId,
  projectId,
  userName,
  userColor,
}: RealtimeBuilderProps) {
  const [connected, setConnected] = useState(false);
  const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUser[]>([]);
  const [aiStreaming, setAiStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'sandbox' | 'workflow' | 'popup' | 'ideas'>('code');

  const ydocRef = useRef<Y.Doc | null>(null);
  const indexeddbRef = useRef<IndexeddbPersistence | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoContainerRef = useRef<HTMLDivElement | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const isApplyingRemoteUpdateRef = useRef(false);

  // Tiptap editor for rich text (ideas/UI descriptions)
  const tiptapEditor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start editing your idea...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  useEffect(() => {
    // Initialize Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Offline persistence with IndexedDB
    const indexeddb = new IndexeddbPersistence(roomId, ydoc);
    indexeddbRef.current = indexeddb;
    indexeddb.whenSynced.then(() => {
      // eslint-disable-next-line no-console
      console.log('Yjs document loaded from IndexedDB');
    });

    // Socket.io for Yjs sync and awareness
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
      path: '/realtime',
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinRoom', {
        roomId,
        userId,
        ideaId,
        projectId,
        userName,
        userColor,
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Receive initial document sync
    socket.on('docSync', (data: { roomId: string; update: number[] }) => {
      if (data.roomId === roomId) {
        isApplyingRemoteUpdateRef.current = true;
        Y.applyUpdate(ydoc, new Uint8Array(data.update));
        isApplyingRemoteUpdateRef.current = false;
      }
    });

    // Receive remote document updates
    socket.on('docUpdate', (data: { roomId: string; update: number[] }) => {
      if (data.roomId === roomId) {
        isApplyingRemoteUpdateRef.current = true;
        Y.applyUpdate(ydoc, new Uint8Array(data.update));
        isApplyingRemoteUpdateRef.current = false;
      }
    });

    // Receive user joined events
    socket.on('userJoined', (data: { roomId: string; userId: string; users: AwarenessUser[] }) => {
      if (data.roomId === roomId) {
        setAwarenessUsers(data.users);
      }
    });

    // Send local Yjs updates to server (debounced for performance)
    const debouncedEmitUpdate = debounce(
      (update: Uint8Array) => {
        if (!isApplyingRemoteUpdateRef.current && socket.connected) {
          socket.emit('applyUpdate', {
            roomId,
            update: Array.from(update),
          });
        }
      },
      100, // 100ms debounce for sub-100ms perceived latency
      { leading: false, trailing: true },
    );

    const updateHandler = (update: Uint8Array) => {
      debouncedEmitUpdate(update);
    };
    ydoc.on('update', updateHandler);

    // Send awareness updates (cursors, selections)
    const sendAwareness = (awareness: Record<string, unknown>) => {
      if (socket.connected) {
        socket.emit('awareness', {
          roomId,
          userId,
          awareness,
        });
      }
    };

    // Initialize Monaco editor
    const initMonaco = () => {
      if (monacoContainerRef.current && !monacoEditorRef.current) {
        const editor = monaco.editor.create(monacoContainerRef.current, {
          value: '',
          language: 'typescript',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: true },
        });
        monacoEditorRef.current = editor;

        // Bind Yjs text to Monaco
        const ytext = ydoc.getText('code');
        const model = editor.getModel();
        if (model) {
          // Create a minimal awareness object for MonacoBinding
          const mockAwareness = {
            getStates: () => new Map(),
            setLocalStateField: () => {},
            on: () => {},
            off: () => {},
          } as any;
          const binding = new MonacoBinding(ytext, model, new Set([editor]), mockAwareness);
          bindingRef.current = binding;
        }

        // Track cursor for awareness
        editor.onDidChangeCursorPosition((e) => {
          sendAwareness({
            cursor: { line: e.position.lineNumber, column: e.position.column },
          });
        });
      }
    };

    // Try immediately, then retry after a short delay
    initMonaco();
    const monacoTimeout = setTimeout(initMonaco, 100);

    // Bind Tiptap to Yjs text (for rich text)
    if (tiptapEditor) {
      const ytextIdeas = ydoc.getText('ideasText');
      ytextIdeas.observe(() => {
        const content = ytextIdeas.toString();
        if (tiptapEditor.getHTML() !== content) {
          tiptapEditor.commands.setContent(content);
        }
      });
      tiptapEditor.on('update', () => {
        const content = tiptapEditor.getHTML();
        const current = ytextIdeas.toString();
        if (current !== content) {
          ytextIdeas.delete(0, current.length);
          ytextIdeas.insert(0, content);
        }
      });
    }

    return () => {
      clearTimeout(monacoTimeout);
      debouncedEmitUpdate.cancel(); // Cancel pending debounced calls
      ydoc.off('update', updateHandler);
      bindingRef.current?.destroy();
      monacoEditorRef.current?.dispose();
      indexeddb.destroy();
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId, ideaId, projectId, userName, userColor, tiptapEditor]);

  const triggerAIStream = async (prompt?: string) => {
    if (!ideaId) return;
    setAiStreaming(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/ideas/${ideaId}/ai-stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        },
      );
      if (!response.ok) {
        throw new Error('AI streaming failed');
      }
      await response.json();
      toast.success('AI improvements streaming', {
        description: 'Watch the code update in real-time!',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error triggering AI stream:', error);
      toast.error('AI streaming failed', {
        description: error instanceof Error ? error.message : 'Please try again',
        action: {
          label: 'Retry',
          onClick: () => triggerAIStream(prompt),
        },
      });
    } finally {
      setAiStreaming(false);
    }
  };

  const triggerDeploy = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('triggerDeploy', { roomId });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Realtime Builder</h1>
          <div className="flex items-center gap-2">
            {connected ? (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                Connecting...
              </span>
            )}
            {awarenessUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {awarenessUsers.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center border-2 border-gray-700"
                      style={{ backgroundColor: user.color }}
                      title={user.name}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {awarenessUsers.length} {awarenessUsers.length === 1 ? 'user' : 'users'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerAIStream()}
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
          <button
            onClick={triggerDeploy}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            🚀 Live Deploy
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tabs */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-gray-800 border-b border-gray-700 flex">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'code'
                  ? 'bg-gray-700 text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Code Editor"
            >
              💻 Code
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'sandbox'
                  ? 'bg-gray-700 text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Code Sandbox"
            >
              🚀 Sandbox
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'workflow'
                  ? 'bg-gray-700 text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Workflow Builder"
            >
              🔄 Workflow
            </button>
            <button
              onClick={() => setActiveTab('popup')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'popup'
                  ? 'bg-gray-700 text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Popup Builder"
            >
              🎯 Popup
            </button>
            <button
              onClick={() => setActiveTab('ideas')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'ideas'
                  ? 'bg-gray-700 text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Ideas"
            >
              💡 Ideas
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'code' && (
              <div className="h-full">
                <div ref={monacoContainerRef} className="h-full" />
              </div>
            )}
            {activeTab === 'sandbox' && ydocRef.current && (
              <ResponsiveSandbox>
                <SandboxEditor
                  roomId={roomId}
                  userId={userId}
                  ideaId={ideaId}
                  initialCode={ydocRef.current.getText('code')?.toString() || ''}
                  initialLang="typescript"
                />
              </ResponsiveSandbox>
            )}
            {activeTab === 'workflow' && (
              <WorkflowBuilder roomId={roomId} userId={userId} ideaId={ideaId} />
            )}
            {activeTab === 'popup' && (
              <PopupBuilder roomId={roomId} ideaId={ideaId} />
            )}
            {activeTab === 'ideas' && (
              <div className="h-full flex flex-col bg-white text-gray-900">
                <div className="flex-1 overflow-y-auto p-4">
                  {tiptapEditor && <EditorContent editor={tiptapEditor} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Always Ideas/Description */}
        <div className="w-1/2 flex flex-col bg-white text-gray-900">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <h2 className="text-sm font-medium">Idea / UI Description</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {tiptapEditor && <EditorContent editor={tiptapEditor} />}
          </div>
        </div>
      </div>

      {/* Footer with user cursors (simplified) */}
      {awarenessUsers.length > 1 && (
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
          Active collaborators:{' '}
          {awarenessUsers.map((user) => (
            <span key={user.id} style={{ color: user.color }} className="ml-2">
              {user.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
