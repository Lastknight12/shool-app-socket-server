import { ConfigService } from '@nestjs/config';
type SocketMiddleware = (socket: any, next: (err?: Error) => void) => void;
export declare const AuthWsMiddleware: (configService: ConfigService) => SocketMiddleware;
export {};
