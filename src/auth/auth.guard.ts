import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import hkdf from '@panva/hkdf';
import { jwtDecrypt } from 'jose';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const headers = context.switchToWs().getClient().request.headers;

    function getCookieValue(cookieHeader, cookieName) {
      const cookies = cookieHeader.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
      }, {});
      return cookies[cookieName];
    }

    async function getDerivedEncryptionKey(
      keyMaterial: string | Buffer,
      salt: string,
    ) {
      return await hkdf(
        'sha256',
        keyMaterial,
        salt,
        `NextAuth.js Generated Encryption Key${salt ? ` (${salt})` : ''}`,
        32,
      );
    }

    const jweSecret = this.config.get('JWT_SECRET');
    const encryptionSecret = await getDerivedEncryptionKey(jweSecret, '');

    const token = getCookieValue(headers.cookie, 'next-auth.session-token');
    try {
      await jwtDecrypt(token, encryptionSecret, {
        clockTolerance: 15,
      });
    } catch {
      return false;
    }

    return true;
  }
}
