import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './db/prisma.service';
import { SellerGateway } from './seller/seller.gateway';
import { RadioCenterGateway } from './radio-center/radio-center.gateway';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), JwtModule],
  providers: [SellerGateway, RadioCenterGateway, PrismaService],
})
export class AppModule {}
