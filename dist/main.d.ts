import { type Socket } from 'socket.io';
import { User } from '@prisma/client';
export type CSocket = Socket & {
    user: User;
};
