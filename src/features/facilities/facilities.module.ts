import { Module } from '@nestjs/common';
import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';
import { PrismaService } from '../../shared/config/prisma.service';
import { ConfigService } from '../../shared/config/config.service';

@Module({
  controllers: [FacilitiesController],
  providers: [FacilitiesService, PrismaService, ConfigService],
  exports: [FacilitiesService],
})
export class FacilitiesModule {}