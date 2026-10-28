import { Module } from '@nestjs/common';
import { LogisticsController } from './logistics.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [LogisticsController],
})
export class LogisticsModule {}
