import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClerkGuard } from '../auth/guards/clerk.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { ClerkUser } from '../../shared/types/user.types';
import { FileUploadService } from '../../shared/utils/file-upload.service';
import { CloudinaryService } from '../../shared/utils/cloudinary.service';

@Controller('suppliers')
@UseGuards(ClerkGuard)
export class SuppliersUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload-certification')
  @UseInterceptors(FileInterceptor('certification'))
  async uploadCertification(
    @CurrentUser() user: ClerkUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.fileUploadService.validateImage(file);
    
    const imageUrl = await this.cloudinaryService.uploadImage(file, 'certifications');
    
    console.log('Certification uploaded for user:', user.id);

    return {
      message: 'Certification uploaded successfully',
      imageUrl,
    };
  }
}