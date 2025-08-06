import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../../shared/config/prisma.service';
import { ConfigService } from '../../shared/config/config.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, ConfigService],
  exports: [AuthService],
})
export class AuthModule {}