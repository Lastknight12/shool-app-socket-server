import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { type Socket } from 'socket.io';
import { User } from '@prisma/client';

export type CSocket = Socket & { user: User };

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
