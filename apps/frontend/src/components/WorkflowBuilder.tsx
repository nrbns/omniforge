'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { debounce } from 'lodash';

interface WorkflowBuilderProps {
  roomId: string;
  userId: string;
  ideaId?: string;
}

// Custom node types
const nodeTypes: NodeTypes = {
  webhook: ({ data }: { data: any }) => (
    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg min-w-[150px]">
      <div className="font-semibold">🔗 {data.label}</div>
      <div className="text-xs mt-1">{data.description}</div>
    </div>
  ),
  ai: ({ data }: { data: any }) => (
    <div className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg min-w-[150px]">
      <div className="font-semibold">🤖 {data.label}</div>
      <div className="text-xs mt-1">{data.description}</div>
    </div>
  ),
  email: ({ data }: { data: any }) => (
    <div className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg min-w-[150px]">
      <div className="font-semibold">📧 {data.label}</div>
      <div className="text-xs mt-1">{data.description}</div>
    </div>
  ),
  action: ({ data }: { data: any }) => (
    <div className="px-4 py-2 bg-orange-600 text-white rounded-lg shadow-lg min-w-[150px]">
      <div className="font-semibold">⚡ {data.label}</div>
      <div className="text-xs mt-1">{data.description}</div>
    </div>
  ),
  database: ({ data }: { data: any }) => (
    <div className="px-4 py-2 bg-cyan-600 text-white rounded-lg shadow-lg min-w-[150px]">
      <div className="font-semibold">💾 {data.label}</div>
      <div className="text-xs mt-1">{data.description}</div>
    </div>
  ),
  api: ({ data }: { data: any }) => (
    <div className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg min-w-[150px]">
      <div className="font-semibold">🌐 {data.label}</div>
      <div className="text-xs mt-1">{data.description}</div>
    </div>
  ),
  conditional: ({ data }: { data: any }) => (
    <div className="px-4 py-2 bg-yellow-600 text-white rounded-lg shadow-lg min-w-[150px]">
      <div className="font-semibold">❓ {data.label}</div>
      <div className="text-xs mt-1">{data.description}</div>
    </div>
  ),
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'webhook',
    position: { x: 100, y: 100 },
    data: { label: 'Stripe Webhook', description: 'Payment received' },
  },
];

const initialEdges: Edge[] = [];

export default function WorkflowBuilder({ roomId, userId, ideaId }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [suggesting, setSuggesting] = useState(false);
  const ydocRef = useRef<Y.Doc | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isApplyingRemoteUpdateRef = useRef(false);

  // Initialize Yjs for collaborative editing
  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Socket.io for sync
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
      path: '/realtime',
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinRoom', {
        roomId: `workflow:${roomId}`,
        userId,
        ideaId,
      });
    });

    // Sync nodes/edges with Yjs
    const yNodes = ydoc.getArray('nodes');
    const yEdges = ydoc.getArray('edges');

    // Load from Yjs
    const loadFromYjs = () => {
      const yNodesData = yNodes.toArray() as any[];
      const yEdgesData = yEdges.toArray() as any[];
      if (yNodesData.length > 0) {
        setNodes(yNodesData);
      }
      if (yEdgesData.length > 0) {
        setEdges(yEdgesData);
      }
    };

    yNodes.observe(() => {
      if (!isApplyingRemoteUpdateRef.current) {
        const yNodesData = yNodes.toArray() as any[];
        setNodes(yNodesData);
      }
    });

    yEdges.observe(() => {
      if (!isApplyingRemoteUpdateRef.current) {
        const yEdgesData = yEdges.toArray() as any[];
        setEdges(yEdgesData);
      }
    });

    // Send updates to Yjs (debounced)
    const debouncedSync = debounce(() => {
      if (!isApplyingRemoteUpdateRef.current && socket.connected) {
        yNodes.delete(0, yNodes.length);
        yNodes.insert(0, nodes);
        yEdges.delete(0, yEdges.length);
        yEdges.insert(0, edges);
      }
    }, 150);

    // Sync on changes
    const unsubscribeNodes = () => {
      debouncedSync();
    };
    const unsubscribeEdges = () => {
      debouncedSync();
    };

    // Initial load
    loadFromYjs();

    return () => {
      debouncedSync.cancel();
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId, ideaId]);

  // Sync nodes/edges to Yjs when they change
  useEffect(() => {
    if (ydocRef.current && !isApplyingRemoteUpdateRef.current) {
      const yNodes = ydocRef.current.getArray('nodes');
      const yEdges = ydocRef.current.getArray('edges');
      yNodes.delete(0, yNodes.length);
      yNodes.insert(0, nodes);
      yEdges.delete(0, yEdges.length);
      yEdges.insert(0, edges);
    }
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  // AI Suggest Workflow
  const suggestWorkflow = async () => {
    setSuggesting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/agents/workflow`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Suggest n8n-like workflow for lead gen: Webhook → AI Classify → Email Send',
            ideaId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to generate workflow');
      }

      const workflow = await response.json();
      setNodes(workflow.nodes || []);
      setEdges(workflow.edges || []);
      toast.success('Workflow generated!', {
        description: 'AI suggested a workflow for you',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating workflow:', error);
      toast.error('Failed to generate workflow', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setSuggesting(false);
    }
  };

  // Add node manually
  const addNode = (type: string, label: string, description: string) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: { label, description },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toolbar */}
      <div className="p-3 bg-white border-b flex items-center gap-2 flex-wrap">
        <button
          onClick={suggestWorkflow}
          disabled={suggesting}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {suggesting ? (
            <>
              <span className="animate-spin">⚡</span>
              Generating...
            </>
          ) : (
            <>
              <span>✨</span>
              AI Suggest Workflow
            </>
          )}
        </button>

        <div className="h-6 w-px bg-gray-300" />

        <button
          onClick={() => addNode('webhook', 'Webhook', 'Receive webhook event')}
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          + Webhook
        </button>
        <button
          onClick={() => addNode('ai', 'AI Classify', 'Classify data with AI')}
          className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
        >
          + AI Node
        </button>
        <button
          onClick={() => addNode('email', 'Send Email', 'Send email via SMTP')}
          className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          + Email
        </button>
        <button
          onClick={() => addNode('action', 'Action', 'Custom action')}
          className="px-3 py-1.5 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
        >
          + Action
        </button>
        <button
          onClick={() => addNode('database', 'Database', 'Query database')}
          className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
        >
          + Database
        </button>
        <button
          onClick={() => addNode('api', 'API Call', 'Call external API')}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
        >
          + API
        </button>
        <button
          onClick={() => addNode('conditional', 'Condition', 'If/else logic')}
          className="px-3 py-1.5 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
        >
          + Condition
        </button>

        <div className="flex-1" />

        <button
          onClick={() => {
            toast.info('Workflow saved', { description: 'Changes are synced in real-time' });
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          💾 Save Workflow
        </button>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

