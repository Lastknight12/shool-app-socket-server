import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthGuard } from 'src/auth/auth.guard';
import { AuthWsMiddleware } from 'src/auth/auth.middleware';
import { PrismaService } from 'src/db/prisma.service';
import { CSocket } from 'src/main';

@WebSocketGateway()
@UseGuards(SocketAuthGuard)
export class RadioCenterGateway {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}
  @WebSocketServer()
  async afterInit(@ConnectedSocket() socket: Socket) {
    socket.use(AuthWsMiddleware(this.config));
  }
  server: Server;

  @SubscribeMessage('order-created')
  async handleOrderCreated(
    @MessageBody() data: string,
    @ConnectedSocket() client: CSocket,
  ) {
    if (client.user.role !== 'STUDENT') {
      throw new WsException('Unauthorized');
    }

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

  @SubscribeMessage('add-track')
  async handleAddTrack(
    @MessageBody() data: string,
    @ConnectedSocket() client: CSocket,
  ) {
    if (client.user.role !== 'RADIO_CENTER') {
      throw new WsException('Unauthorized');
    }

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

  @SubscribeMessage('refresh')
  async handleRefresh(@ConnectedSocket() client: CSocket) {
    if (client.user.role !== 'RADIO_CENTER') {
      throw new WsException('Unauthorized');
    }

    client.to('radioCenter').emit('refresh');
  }
}
