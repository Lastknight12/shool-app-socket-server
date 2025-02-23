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
import { ServerAuthGuard } from 'src/auth/server.guard';
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
export class RadioCenterGateway {
  constructor(private prisma: PrismaService) {}
  @WebSocketServer()
  server: Server;

  @UseGuards(ServerAuthGuard)
  @SubscribeMessage('order-created')
  async handleOrderCreated(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    const order = await this.prisma.musicOrder.findUnique({
      where: {
        id: data,
      },
      include: {
        buyer: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!order) {
      throw new WsException('Invalid data');
    }

    const { buyerId, ...formatedOrder } = order;

    client.to('radioCenter').emit('order-created', formatedOrder);
  }

  @UseGuards(ServerAuthGuard)
  @SubscribeMessage('add-track')
  async handleAddTrack(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    const order = await this.prisma.musicOrder.findUnique({
      where: {
        id: data,
      },
    });

    if (!order) {
      throw new WsException('Invalid data');
    }

    client.to('radioCenter-client').emit('add-track', order);
  }

  @UseGuards(ServerAuthGuard)
  @SubscribeMessage('refresh')
  async handleRefresh(@ConnectedSocket() client: Socket) {
    client.to('radioCenter').emit('refresh');
  }
}
