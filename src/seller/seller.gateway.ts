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
import { Server, Socket } from 'socket.io';
import { SocketAuthGuard } from 'src/auth/auth.guard';
import { PrismaService } from 'src/db/prisma.service';

interface payToken {
  products: { id: string; count: number }[];
  transactionId: string;
  randomChannelId: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
@UseGuards(SocketAuthGuard)
export class SellerGateway {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);
    console.log('joined', data.roomId);
  }

  @SubscribeMessage('pay')
  async handlePay(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    const decode = (await this.jwtService.verifyAsync(data, {
      secret: 'test',
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

    client.to(decode.randomChannelId).emit('pay', { error: null });
  }
}
