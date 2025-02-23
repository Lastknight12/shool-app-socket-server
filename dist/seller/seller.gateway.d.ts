import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/db/prisma.service';
import { CSocket } from 'src/main';
export declare class SellerGateway {
    private jwtService;
    private prisma;
    private config;
    constructor(jwtService: JwtService, prisma: PrismaService, config: ConfigService);
    server: Server;
    afterInit(socket: Socket): Promise<void>;
    handleJoinRoom(data: {
        roomId: string;
    }, client: Socket): Promise<void>;
    handlePay(data: string, client: CSocket): Promise<void>;
}
