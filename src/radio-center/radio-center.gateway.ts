import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { MusicOrder } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { SocketAuthGuard } from 'src/auth/auth.guard';
import { PrismaService } from 'src/db/prisma.service';

interface Order
  extends Pick<
    MusicOrder,
    'id' | 'musicUrl' | 'status' | 'musicImage' | 'musicTitle'
  > {
  buyer: {
    name: string;
  };
}

@WebSocketGateway()
@UseGuards(SocketAuthGuard)
export class RadioCenterGateway {
  constructor(private prisma: PrismaService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('order-created')
  async handleOrderCreated(
    @MessageBody() data: Order,
    @ConnectedSocket() client: Socket,
  ) {
    const order = this.prisma.musicOrder.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!order) {
      throw new WsException('Invalid data');
    }

    client.to('radioCenter').emit('order-created', data);
  }

  @SubscribeMessage('add-track')
  async handleAddTrack(
    @MessageBody() data: Order,
    @ConnectedSocket() client: Socket,
  ) {
    const order = this.prisma.musicOrder.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!order) {
      throw new WsException('Invalid data');
    }

    client.to('radioCenter-client').emit('add-track', data);
  }

  @SubscribeMessage('refresh')
  async handleRefresh(
    @MessageBody() data: Order,
    @ConnectedSocket() client: Socket,
  ) {
    client.to('radioCenter').emit('refresh');
  }
}
