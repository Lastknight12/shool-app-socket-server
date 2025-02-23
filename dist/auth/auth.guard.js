"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const hkdf_1 = require("@panva/hkdf");
const jose_1 = require("jose");
let SocketAuthGuard = class SocketAuthGuard {
    config;
    constructor(config) {
        this.config = config;
    }
    async canActivate(context) {
        const headers = context.switchToWs().getClient().request.headers;
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
            decoded = payload;
        }
        catch (err) {
            if (err.code === 'ERR_JWE_INVALID') {
                return false;
            }
        }
        if (decoded) {
            return true;
        }
        else {
            return false;
        }
    }
};
exports.SocketAuthGuard = SocketAuthGuard;
exports.SocketAuthGuard = SocketAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SocketAuthGuard);
//# sourceMappingURL=auth.guard.js.map