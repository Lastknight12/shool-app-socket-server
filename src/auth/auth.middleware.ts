import { ConfigService } from '@nestjs/config';
import hkdf from '@panva/hkdf';
import { jwtDecrypt } from 'jose';

type SocketMiddleware = (socket: any, next: (err?: Error) => void) => void;

export type CustomUser =
  | {
      id: string;
      name: string;
      email: string;
      image: string;
      balance: number;
      role: 'STUDENT';
      studentClass: { id: string; name: string } | null;
    }
  | {
      id: string;
      name: string;
      email: string;
      image: string;
      balance: number;
      role: 'TEACHER';
      teacherClasses: { id: string; name: string }[];
    }
  | {
      id: string;
      name: string;
      email: string;
      image: string;
      balance: number;
      role: 'ADMIN';
    }
  | {
      id: string;
      name: string;
      email: string;
      image: string;
      balance: number;
      role: 'RADIO_CENTER';
    }
  | {
      id: string;
      name: string;
      email: string;
      image: string;
      balance: number;
      role: 'SELLER';
    };
interface JWT extends Omit<CustomUser, 'id'> {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}

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

        const { sub, iat, exp, jti, ...user } = payload as unknown as JWT;
        decoded = { id: sub, ...user } as CustomUser;
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
