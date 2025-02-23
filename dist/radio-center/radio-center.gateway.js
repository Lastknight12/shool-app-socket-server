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
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const server_guard_1 = require("../auth/server.guard");
const prisma_service_1 = require("../db/prisma.service");
let RadioCenterGateway = class RadioCenterGateway {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    server;
    async handleOrderCreated(data, client) {
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
        client.to('radioCenter').emit('refresh');
    }
};
exports.RadioCenterGateway = RadioCenterGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RadioCenterGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(server_guard_1.ServerAuthGuard),
    (0, websockets_1.SubscribeMessage)('order-created'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RadioCenterGateway.prototype, "handleOrderCreated", null);
__decorate([
    (0, common_1.UseGuards)(server_guard_1.ServerAuthGuard),
    (0, websockets_1.SubscribeMessage)('add-track'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RadioCenterGateway.prototype, "handleAddTrack", null);
__decorate([
    (0, common_1.UseGuards)(server_guard_1.ServerAuthGuard),
    (0, websockets_1.SubscribeMessage)('refresh'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RadioCenterGateway.prototype, "handleRefresh", null);
exports.RadioCenterGateway = RadioCenterGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RadioCenterGateway);
//# sourceMappingURL=radio-center.gateway.js.map