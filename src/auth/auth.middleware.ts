import { ConfigService } from '@nestjs/config';
import hkdf from '@panva/hkdf';
import { jwtDecrypt } from 'jose';

type SocketMiddleware = (socket: any, next: (err?: Error) => void) => void;

export const AuthWsMiddleware = (
  configService: ConfigService,
): SocketMiddleware => {
  return async (socket: any, next) => {
    try {
      const headers = socket.request.headers;

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

      socket = Object.assign(socket, {
        user: decoded,
      });
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  };
};
