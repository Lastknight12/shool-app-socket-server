import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/db/prisma.service';
import { CSocket } from 'src/main';
export declare class RadioCenterGateway {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    afterInit(socket: Socket): Promise<void>;
    server: Server;
    handleOrderCreated(data: string, client: CSocket): Promise<void>;
    handleAddTrack(data: string, client: CSocket): Promise<void>;
    handleRefresh(client: CSocket): Promise<void>;
}
