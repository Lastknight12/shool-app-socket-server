import { ConfigService } from '@nestjs/config';
type SocketMiddleware = (socket: any, next: (err?: Error) => void) => void;
export type CustomUser = {
    id: string;
    name: string;
    email: string;
    image: string;
    balance: number;
    role: 'STUDENT';
    studentClass: {
        id: string;
        name: string;
    } | null;
} | {
    id: string;
    name: string;
    email: string;
    image: string;
    balance: number;
    role: 'TEACHER';
    teacherClasses: {
        id: string;
        name: string;
    }[];
} | {
    id: string;
    name: string;
    email: string;
    image: string;
    balance: number;
    role: 'ADMIN';
} | {
    id: string;
    name: string;
    email: string;
    image: string;
    balance: number;
    role: 'RADIO_CENTER';
} | {
    id: string;
    name: string;
    email: string;
    image: string;
    balance: number;
    role: 'SELLER';
};
export declare const AuthWsMiddleware: (configService: ConfigService) => SocketMiddleware;
export {};
