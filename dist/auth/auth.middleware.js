"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthWsMiddleware = void 0;
const hkdf_1 = require("@panva/hkdf");
const jose_1 = require("jose");
const AuthWsMiddleware = (configService) => {
    return async (socket, next) => {
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
            async function getDerivedEncryptionKey(keyMaterial, salt) {
                return await (0, hkdf_1.default)('sha256', keyMaterial, salt, `NextAuth.js Generated Encryption Key${salt ? ` (${salt})` : ''}`, 32);
            }
            const encryptionSecret = await getDerivedEncryptionKey('test', '');
            const token = getCookieValue(headers.cookie, 'next-auth.session-token');
            let decoded;
            try {
                const { payload } = await (0, jose_1.jwtDecrypt)(token, encryptionSecret, {
                    clockTolerance: 15,
                });
                const { sub, iat, exp, jti, ...user } = payload;
                decoded = { id: sub, ...user };
            }
            catch (err) {
                if (err.code === 'ERR_JWE_INVALID') {
                    return false;
                }
            }
            socket = Object.assign(socket, {
                user: decoded,
            });
            next();
        }
        catch (error) {
            next(new Error('Unauthorized'));
        }
    };
};
exports.AuthWsMiddleware = AuthWsMiddleware;
//# sourceMappingURL=auth.middleware.js.map