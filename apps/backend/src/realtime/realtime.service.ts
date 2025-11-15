import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeService {
  constructor(private gateway: RealtimeGateway) {}

  async emit(channel: string, event: string, data: any) {
    this.gateway.server.to(channel).emit(event, data);
  }

  async emitToRoom(room: string, event: string, data: any) {
    this.gateway.server.to(room).emit(event, data);
  }

  async broadcast(event: string, data: any) {
    this.gateway.server.emit(event, data);
  }
}

