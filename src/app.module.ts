import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { FacilitiesModule } from './features/facilities/facilities.module';
import { ConfigService } from './shared/config/config.service';
import { validateEnv } from './shared/config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      validate: validateEnv,
    }),
    AuthModule,
    FacilitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}