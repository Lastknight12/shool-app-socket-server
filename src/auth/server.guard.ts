import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServerAuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const data = context.switchToWs().getClient().handshake.auth;

    if (data.secret && data.secret === this.config.get('SOCKET_SECRET')) {
      return true;
    } else return false;
  }
}
