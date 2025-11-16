'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';

interface UseIdeaRealtimeDocOptions {
  ideaId: string;
  userId?: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onPresenceUpdate?: (userId: string, cursor?: { line: number; column: number }, selection?: { start: number; end: number }) => void;
}

/**
 * React hook for real-time collaborative editing of an idea using Yjs + Socket.io.
 *
 * Returns:
 * - `ydoc`: The Yjs document (for binding to editors)
 * - `ytext`: The Y.Text field for the idea description
 * - `connected`: Connection status
 * - `users`: List of connected user IDs
 */
export function useIdeaRealtimeDoc({
  ideaId,
  userId = 'anonymous',
  initialContent = '',
  onContentChange,
  onPresenceUpdate,
}: UseIdeaRealtimeDocOptions) {
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const initializedRef = useRef(false);
  const isApplyingRemoteUpdateRef = useRef(false);

  useEffect(() => {
    // Initialize Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const ytext = ydoc.getText('description');
    ytextRef.current = ytext;

    // Set initial content if provided
    if (initialContent && !initializedRef.current) {
      ytext.insert(0, initialContent);
      initializedRef.current = true;
    }

    // Listen for Yjs changes and notify parent
    const observer = () => {
      const content = ytext.toString();
      onContentChange?.(content);
    };
    ytext.observe(observer);

    // Initialize Socket.io connection
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Join the idea room
      socket.emit('idea:join', { ideaId, userId });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Receive initial sync from server
    socket.on('idea:sync', (data: { ideaId: string; update: string }) => {
      if (data.ideaId === ideaId) {
        // Convert base64 to Uint8Array (browser-compatible)
        const binaryString = atob(data.update);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        isApplyingRemoteUpdateRef.current = true;
        Y.applyUpdate(ydoc, bytes);
        isApplyingRemoteUpdateRef.current = false;
        initializedRef.current = true;
      }
    });

    // Receive remote updates from other clients
    socket.on('idea:remoteUpdate', (data: { ideaId: string; update: string }) => {
      if (data.ideaId === ideaId) {
        // Convert base64 to Uint8Array (browser-compatible)
        const binaryString = atob(data.update);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        isApplyingRemoteUpdateRef.current = true;
        Y.applyUpdate(ydoc, bytes);
        isApplyingRemoteUpdateRef.current = false;
      }
    });

    // Track users joining/leaving
    socket.on('idea:userJoined', (data: { ideaId: string; userId: string; users?: string[] }) => {
      if (data.ideaId === ideaId) {
        if (data.users) {
          setUsers(data.users);
        } else {
          setUsers((prev) => {
            if (!prev.includes(data.userId)) {
              return [...prev, data.userId];
            }
            return prev;
          });
        }
      }
    });

    // Handle presence updates from other users
    socket.on('idea:presenceUpdate', (data: { ideaId: string; userId: string; cursor?: { line: number; column: number }; selection?: { start: number; end: number } }) => {
      if (data.ideaId === ideaId && data.userId !== userId) {
        onPresenceUpdate?.(data.userId, data.cursor, data.selection);
      }
    });

    // Send local updates to server
    const updateHandler = (update: Uint8Array) => {
      // Don't broadcast updates that came from remote (to avoid loops)
      if (!isApplyingRemoteUpdateRef.current && socket.connected) {
        // Convert Uint8Array to base64 (browser-compatible)
        // Use chunked approach for large arrays to avoid stack overflow
        let binaryString = '';
        const chunkSize = 8192;
        for (let i = 0; i < update.length; i += chunkSize) {
          const chunk = update.slice(i, i + chunkSize);
          binaryString += String.fromCharCode(...chunk);
        }
        const base64 = btoa(binaryString);
        socket.emit('idea:update', { ideaId, update: base64 });
      }
    };
    ydoc.on('update', updateHandler);

    return () => {
      ytext.unobserve(observer);
      ydoc.off('update', updateHandler);
      socket.emit('leave', `idea:${ideaId}`);
      socket.disconnect();
      ydoc.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId, userId, initialContent, onContentChange]);

  /**
   * Send presence update (cursor position, selection).
   */
  const sendPresence = (cursor?: { line: number; column: number }, selection?: { start: number; end: number }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('idea:presence', {
        ideaId,
        userId,
        cursor,
        selection,
      });
    }
  };

  /**
   * Trigger AI streaming improvements.
   */
  const triggerAIStream = async (prompt?: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/ideas/${ideaId}/ai-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error triggering AI stream:', error);
      throw error;
    }
  };

  return {
    ydoc: ydocRef.current,
    ytext: ytextRef.current,
    connected,
    users,
    sendPresence,
    triggerAIStream,
  };
}

