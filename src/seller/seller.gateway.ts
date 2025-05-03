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

interface payToken {
  products: { id: string; count: number }[];
  transactionId: string;
  randomChannelId: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
})
export class SellerGateway {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}
  @WebSocketServer()
  server: Server;

  async afterInit(@ConnectedSocket() socket: Socket) {
    socket.use(AuthWsMiddleware(this.config));
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('pay')
  async handlePay(
    @MessageBody() data: string,
    @ConnectedSocket() client: CSocket,
  ) {
    const decode = (await this.jwtService.verifyAsync(data, {
      secret: this.config.get('JWT_SECRET'),
    })) as payToken;

    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id: decode.transactionId,
        type: 'BUY',
      },
    });

    if (!transaction || transaction.status !== 'SUCCESS') {
      throw new WsException('Invalid credentials');
    }

    if (transaction.senderId !== client.user.id) {
      throw new WsException('Unauthorized');
    }

    client.to(decode.randomChannelId).emit('pay', { error: null });
  }
}
