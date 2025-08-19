import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { PrismaService } from '../../shared/config/prisma.service';
import { ConfigService } from '../../shared/config/config.service';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, PrismaService, ConfigService],
  exports: [OnboardingService],
})
export class OnboardingModule {}