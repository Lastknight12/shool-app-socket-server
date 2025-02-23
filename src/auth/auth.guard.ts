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

    const encryptionSecret = await getDerivedEncryptionKey('test', '');

    const token = getCookieValue(headers.cookie, 'next-auth.session-token');
    let decoded;
    try {
      const { payload } = await jwtDecrypt(token, encryptionSecret, {
        clockTolerance: 15,
      });

      decoded = payload;
    } catch (err) {
      if (err.code === 'ERR_JWE_INVALID') {
        return false;
      }
    }

    if (decoded) {
      return true;
    } else {
      return false;
    }
  }
}
