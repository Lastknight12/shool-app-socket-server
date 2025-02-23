import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/db/prisma.service';
export declare class SellerGateway {
    private jwtService;
    private prisma;
    private config;
    constructor(jwtService: JwtService, prisma: PrismaService, config: ConfigService);
    server: Server;
    handleJoinRoom(data: {
        roomId: string;
    }, client: Socket): Promise<void>;
    handlePay(data: string, client: Socket): Promise<void>;
}
