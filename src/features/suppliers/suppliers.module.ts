import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersUploadController } from './suppliers-upload.controller';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '../../shared/config/prisma.service';
import { FileUploadService } from '../../shared/utils/file-upload.service';
import { CloudinaryService } from '../../shared/utils/cloudinary.service';
import { ConfigService } from '../../shared/config/config.service';

@Module({
  controllers: [SuppliersController, SuppliersUploadController],
  providers: [SuppliersService, PrismaService, FileUploadService, CloudinaryService, ConfigService],
  exports: [SuppliersService],
})
export class SuppliersModule {}