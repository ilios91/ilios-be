import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class FileUploadService {
  constructor(private readonly config: ConfigService) {}

  validateImage(file: Express.Multer.File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PNG and JPG files are allowed');
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }
  }

  generateFileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    return `certifications/${userId}_${timestamp}.${extension}`;
  }
}