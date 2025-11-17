/**
 * RealtimeAgent - Generates WebSocket endpoints and real-time features
 * 
 * This agent creates WebSocket gateway code for generated applications,
 * enabling real-time collaboration, live updates, and presence awareness.
 */
export class RealtimeAgent {
  /**
   * Generates WebSocket endpoints and real-time features based on spec
   * 
   * @param spec - Application specification with realtime requirements
   * @returns Generated WebSocket gateway files
   */
  async generateRealtime(spec: any): Promise<{ files: Array<{ path: string; content: string }> }> {
    const files: Array<{ path: string; content: string }> = [];

    // Generate main WebSocket gateway
    files.push({
      path: 'src/realtime/realtime.gateway.ts',
      content: this.generateGateway(spec),
    });

    // Generate real-time service
    files.push({
      path: 'src/realtime/realtime.service.ts',
      content: this.generateService(spec),
    });

    // Generate frontend WebSocket client hook
    files.push({
      path: 'src/hooks/useRealtime.ts',
      content: this.generateFrontendHook(spec),
    });

    // Generate channel-specific handlers
    for (const channel of spec.realtime || []) {
      files.push({
        path: `src/realtime/channels/${channel.name || channel.channel}.ts`,
        content: this.generateChannel(channel),
      });
    }

    return { files };
  }

  /**
   * Generate NestJS WebSocket Gateway
   */
  private generateGateway(spec: any): string {
    const channels = (spec.realtime || []).map((c: any) => c.channel || c.name).join(', ');
    
    return `import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/realtime',
})
@Injectable()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Client connected
  }

  handleDisconnect(client: Socket) {
    // Client disconnected
  }

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

  // Generated channels: ${channels}
  ${(spec.realtime || []).map((c: any) => this.generateChannelHandler(c)).join('\n\n  ')}
}
`;
  }

  /**
   * Generate channel-specific handler
   */
  private generateChannelHandler(channel: any): string {
    const channelName = channel.channel || channel.name || 'default';
    const events = channel.events || ['update', 'message'];
    
    return events.map((event: string) => `
  @SubscribeMessage('${channelName}:${event}')
  handle${this.toPascalCase(channelName)}${this.toPascalCase(event)}(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast to all clients in ${channelName} channel
    this.server.to('${channelName}').emit('${channelName}:${event}', data);
    return { success: true };
  }`).join('');
  }

  /**
   * Generate real-time service
   */
  private generateService(spec: any): string {
    return `import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeService {
  constructor(private gateway: RealtimeGateway) {}

  async emit(channel: string, event: string, data: any) {
    this.gateway.server.to(channel).emit(event, data);
  }

  async broadcast(event: string, data: any) {
    this.gateway.server.emit(event, data);
  }
}
`;
  }

  /**
   * Generate frontend React hook
   */
  private generateFrontendHook(spec: any): string {
    return `import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export function useRealtime(channel: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001/realtime', {
      transports: ['websocket'],
      reconnection: true,
    });

    s.on('connect', () => {
      setConnected(true);
      s.emit('join', channel);
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(s);

    return () => {
      s.emit('leave', channel);
      s.disconnect();
    };
  }, [channel]);

  const emit = useCallback((event: string, data: any) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  }, [socket, connected]);

  return { socket, connected, emit };
}
`;
  }

  /**
   * Generate channel class
   */
  private generateChannel(channel: any): string {
    const channelName = channel.channel || channel.name || 'default';
    const className = this.toPascalCase(channelName) + 'Channel';
    
    return `import { Injectable } from '@nestjs/common';
import { RealtimeService } from '../realtime.service';

@Injectable()
export class ${className} {
  constructor(private realtime: RealtimeService) {}

  emit(event: string, data: any) {
    this.realtime.emit('${channelName}', event, data);
  }

  broadcast(data: any) {
    this.realtime.broadcast('${channelName}:update', data);
  }
}
`;
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

