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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const auth_guard_1 = require("../auth/auth.guard");
const auth_middleware_1 = require("../auth/auth.middleware");
const prisma_service_1 = require("../db/prisma.service");
let SellerGateway = class SellerGateway {
    jwtService;
    prisma;
    config;
    constructor(jwtService, prisma, config) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.config = config;
    }
    server;
    async afterInit(socket) {
        socket.use((0, auth_middleware_1.AuthWsMiddleware)(this.config));
    }
    async handleJoinRoom(data, client) {
        client.join(data.roomId);
    }
    async handlePay(data, client) {
        const decode = (await this.jwtService.verifyAsync(data, {
            secret: this.config.get('JWT_SECRET'),
        }));
        const transaction = await this.prisma.transaction.findUnique({
            where: {
                id: decode.transactionId,
                type: 'BUY',
            },
        });
        if (!transaction || transaction.status !== 'SUCCESS') {
            throw new websockets_1.WsException('Invalid credentials');
        }
        if (transaction.senderId !== client.user.id) {
            throw new websockets_1.WsException('Unauthorized');
        }
        client.to(decode.randomChannelId).emit('pay', { error: null });
    }
};
exports.SellerGateway = SellerGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SellerGateway.prototype, "server", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SellerGateway.prototype, "afterInit", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.SocketAuthGuard),
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SellerGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.SocketAuthGuard),
    (0, websockets_1.SubscribeMessage)('pay'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SellerGateway.prototype, "handlePay", null);
exports.SellerGateway = SellerGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        config_1.ConfigService])
], SellerGateway);
//# sourceMappingURL=seller.gateway.js.map