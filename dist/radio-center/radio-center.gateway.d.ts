import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/db/prisma.service';
export declare class RadioCenterGateway {
    private prisma;
    constructor(prisma: PrismaService);
    server: Server;
    handleOrderCreated(data: string, client: Socket): Promise<void>;
    handleAddTrack(data: string, client: Socket): Promise<void>;
    handleRefresh(client: Socket): Promise<void>;
}
