import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() channel: string, @ConnectedSocket() client: Socket) {
    client.join(channel);
    console.log(`Client ${client.id} joined channel: ${channel}`);
    return { success: true, channel };
  }

  @SubscribeMessage('leave')
  handleLeave(@MessageBody() channel: string, @ConnectedSocket() client: Socket) {
    client.leave(channel);
    console.log(`Client ${client.id} left channel: ${channel}`);
    return { success: true, channel };
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { event: 'pong', data: 'pong' };
  }
}
