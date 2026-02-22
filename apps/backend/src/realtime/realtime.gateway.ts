import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import * as Y from 'yjs';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import * as WebSocket from 'ws';
import { throttle } from 'lodash';

type RoomJoinPayload = {
  roomId: string;
  userId: string;
  ideaId?: string;
  projectId?: string;
  userName?: string;
  userColor?: string;
};
type YjsUpdatePayload = { roomId: string; update: number[] };
type AwarenessPayload = {
  roomId: string;
  userId: string;
  awareness: Record<string, unknown>;
};

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/realtime',
})
@Injectable()
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(RealtimeGateway.name);
  
  @WebSocketServer()
  server: Server;

  /**
   * Yjs documents per room (roomId -> Y.Doc)
   */
  private readonly yDocs = new Map<string, Y.Doc>();

  /**
   * Track active users per room
   */
  private readonly roomUsers = new Map<string, Map<string, { name: string; color: string }>>();

  /**
   * Throttled persistence functions per room
   */
  private readonly persistFunctions = new Map<string, () => Promise<void>>();

  /**
   * WebSocket server for Yjs (separate from Socket.io for y-websocket compatibility)
   */
  private wss: WebSocket.Server | null = null;

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    // Setup WebSocket server for Yjs (y-websocket compatibility)
    this.wss = new WebSocket.Server({ noServer: true, path: '/yjs' });

    // Handle upgrade from HTTP server
    server.engine.on('connection', () => {
      this.logger.log('Socket.io connection established');
    });
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  /**
   * Generic channel join (backwards compatible)
   */
  @SubscribeMessage('join')
  handleJoin(@MessageBody() channel: string, @ConnectedSocket() client: Socket) {
    client.join(channel);
    return { success: true, channel };
  }

  @SubscribeMessage('leave')
  handleLeave(@MessageBody() channel: string, @ConnectedSocket() client: Socket) {
    client.leave(channel);
    return { success: true, channel };
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', data: 'pong' };
  }

  /**
   * Join a realtime room with Yjs document.
   */
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() payload: RoomJoinPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, ideaId, projectId, userName, userColor } = payload;
    client.join(roomId);

    // Track user in room
    if (!this.roomUsers.has(roomId)) {
      this.roomUsers.set(roomId, new Map());
    }
    this.roomUsers.get(roomId)!.set(userId, {
      name: userName || userId,
      color: userColor || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    });

    // Get or create Yjs document
    let doc = this.yDocs.get(roomId);
    if (!doc) {
      doc = new Y.Doc();
      this.yDocs.set(roomId, doc);

      // Load from Prisma (persistent storage)
      const saved = await this.prisma.yjsState.findUnique({
        where: { roomId },
      });
      if (saved?.yjsState) {
        Y.applyUpdate(doc, Buffer.from(saved.yjsState));
      }

      // Setup throttled persistence (save every 5 seconds max)
      const persist = throttle(
        async () => {
          try {
            const d = this.yDocs.get(roomId);
            if (!d) return;
            const state = Y.encodeStateAsUpdate(d);
            
            // Persist to Prisma if YjsState model exists
            try {
              await (this.prisma as any).yjsState?.upsert({
                where: { roomId },
                update: {
                  yjsState: Buffer.from(state),
                  ideaId: ideaId || undefined,
                  projectId: projectId || undefined,
                },
                create: {
                  roomId,
                  yjsState: Buffer.from(state),
                  ideaId: ideaId || undefined,
                  projectId: projectId || undefined,
                },
              });
            } catch (prismaError) {
              // YjsState model may not exist - that's okay
              this.logger.debug('YjsState persistence skipped (model may not exist)');
            }
            
            // Always cache in Redis for fast access
            await this.redisService.set(
              `yjs:${roomId}`,
              Buffer.from(state).toString('base64'),
              3600,
            );
          } catch (error) {
            this.logger.error('Error persisting Yjs state:', error);
          }
        },
        5000, // Throttle to 5 seconds
        { leading: false, trailing: true },
      );
      this.persistFunctions.set(roomId, persist as () => Promise<void>);

      // Persist on document updates
      doc.on('update', () => {
        persist();
      });
    }

    // Send initial document state to client
    const initialUpdate = Y.encodeStateAsUpdate(doc);
    client.emit('docSync', {
      roomId,
      update: Array.from(initialUpdate),
    });

    // Broadcast user joined
    const users = Array.from(this.roomUsers.get(roomId)!.entries()).map(([id, data]) => ({
      id,
      ...data,
    }));
    this.server.to(roomId).emit('userJoined', {
      roomId,
      userId,
      users,
    });

    return { success: true, roomId, users };
  }

  /**
   * Apply Yjs update from client and broadcast to others.
   */
  @SubscribeMessage('applyUpdate')
  handleApplyUpdate(
    @MessageBody() payload: YjsUpdatePayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, update } = payload;
    const doc = this.yDocs.get(roomId);
    if (!doc) {
      return { success: false, error: 'Room not found' };
    }

    // Apply update to document
    Y.applyUpdate(doc, new Uint8Array(update));

    // Broadcast to all other clients in room (excluding sender)
    client.to(roomId).emit('docUpdate', {
      roomId,
      update,
    });

    return { success: true };
  }

  /**
   * Handle awareness updates (cursors, selections, user state).
   */
  @SubscribeMessage('awareness')
  handleAwareness(
    @MessageBody() payload: AwarenessPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, awareness } = payload;
    // Broadcast awareness to all other clients
    client.to(roomId).emit('awarenessUpdate', {
      roomId,
      userId,
      awareness,
    });
    return { success: true };
  }

  /**
   * Backwards compatible: Join idea room (maps to joinRoom).
   */
  @SubscribeMessage('idea:join')
  async handleIdeaJoin(
    @MessageBody() payload: { ideaId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    return this.handleJoinRoom(
      {
        roomId: `idea:${payload.ideaId}`,
        userId: payload.userId,
        ideaId: payload.ideaId,
      },
      client,
    );
  }

  /**
   * Backwards compatible: Apply idea update.
   */
  @SubscribeMessage('idea:update')
  async handleIdeaUpdate(
    @MessageBody() payload: { ideaId: string; update: string },
    @ConnectedSocket() client: Socket,
  ) {
    const update = Buffer.from(payload.update, 'base64');
    return this.handleApplyUpdate(
      {
        roomId: `idea:${payload.ideaId}`,
        update: Array.from(update),
      },
      client,
    );
  }

  /**
   * Inject AI-generated content into Yjs document (for streaming AI responses).
   */
  async injectAIContent(
    roomId: string,
    field: string,
    content: string,
    position?: number,
  ): Promise<{ success: boolean; position: number }> {
    let doc = this.yDocs.get(roomId);
    if (!doc) {
      doc = new Y.Doc();
      this.yDocs.set(roomId, doc);
    }

    const ytext = doc.getText(field);
    const insertPos = position !== undefined ? position : ytext.length;
    ytext.insert(insertPos, content);

    // Trigger persistence
    const persist = this.persistFunctions.get(roomId);
    if (persist) {
      await (persist as () => Promise<void>)();
    }

    // Broadcast update to all clients
    const update = Y.encodeStateAsUpdate(doc);
    this.server.to(roomId).emit('docUpdate', {
      roomId,
      update: Array.from(update),
    });

    return { success: true, position: insertPos + content.length };
  }

  /**
   * Get Yjs document for a room (for server-side operations).
   */
  getDoc(roomId: string): Y.Doc | undefined {
    return this.yDocs.get(roomId);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
    // TODO: Track client->room mapping to properly clean up roomUsers on disconnect
    // For now, rooms persist until server restart (documents are in memory)
  }
}
