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
exports.RadioCenterGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const auth_guard_1 = require("../auth/auth.guard");
const auth_middleware_1 = require("../auth/auth.middleware");
const prisma_service_1 = require("../db/prisma.service");
let RadioCenterGateway = class RadioCenterGateway {
    prisma;
    config;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async afterInit(socket) {
        socket.use((0, auth_middleware_1.AuthWsMiddleware)(this.config));
    }
    server;
    async handleOrderCreated(data, client) {
        if (client.user.role !== 'STUDENT') {
            throw new websockets_1.WsException('Unauthorized');
        }
        const order = await this.prisma.musicOrder.findUnique({
            where: {
                id: data,
            },
            include: {
                buyer: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        if (!order) {
            throw new websockets_1.WsException('Invalid data');
        }
        const { buyerId, ...formatedOrder } = order;
        client.to('radioCenter').emit('order-created', formatedOrder);
    }
    async handleAddTrack(data, client) {
        if (client.user.role !== 'RADIO_CENTER') {
            throw new websockets_1.WsException('Unauthorized');
        }
        const order = await this.prisma.musicOrder.findUnique({
            where: {
                id: data,
            },
        });
        if (!order) {
            throw new websockets_1.WsException('Invalid data');
        }
        client.to('radioCenter-client').emit('add-track', order);
    }
    async handleRefresh(client) {
        if (client.user.role !== 'RADIO_CENTER') {
            throw new websockets_1.WsException('Unauthorized');
        }
        client.to('radioCenter').emit('refresh');
    }
};
exports.RadioCenterGateway = RadioCenterGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RadioCenterGateway.prototype, "afterInit", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('order-created'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RadioCenterGateway.prototype, "handleOrderCreated", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('add-track'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RadioCenterGateway.prototype, "handleAddTrack", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('refresh'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RadioCenterGateway.prototype, "handleRefresh", null);
exports.RadioCenterGateway = RadioCenterGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(),
    (0, common_1.UseGuards)(auth_guard_1.SocketAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], RadioCenterGateway);
//# sourceMappingURL=radio-center.gateway.js.map